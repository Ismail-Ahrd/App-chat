import {getServerSession} from "next-auth";
import { authOptions } from "@/lib/auth";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { z } from "zod"; 
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const {email: emailToAdd} = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string;

        if (!idToAdd) {
            return new Response('This Person does not exist.', {status: 400});
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response('Unauthorized', {status: 401});
        }

        if (idToAdd === session.user.id) {
            return new Response('You cannot add your self as a friend.', {status:400});
        }

        //check if user already added
        const isAlreadyAdded = (await fetchRedis(
            'sismember',
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        )) as 0 | 1;

        if (isAlreadyAdded) {
            return new Response('Already added this user', {status: 400});
        }

        //check if user already friend
        const isAlreadyFriends = (await fetchRedis(
            'sismember', 
            `user:${session.user.id}:friends`, 
            idToAdd
        )) as 0 | 1;

        if (isAlreadyFriends) {
            return new Response('Already friend with this user', {status: 400});
        }

        pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
                senderId: session.user.id,
                senderEmail: session.user.email
            }
        );

        //valid request, send friend request
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id); 
        return new Response('OK');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', {status: 422});
        }
        //console.log(error);
        
        return new Response('Inavalid request', {status: 400});
    }
}