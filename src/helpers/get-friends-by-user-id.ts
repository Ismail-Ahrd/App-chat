import { fetchRedis } from "./redis";

export async function getFriendsByUserId(userId: string) {
    //retreive friends for current user
    const friendsIds = (await fetchRedis(
        'smembers',
        `user:${userId}:friends`
    )) as string [];

    const friends = await Promise.all(
        friendsIds.map( async (friendId) => {
            const friendResult = (await fetchRedis(
                'get',
                `user:${friendId}`
            )) as string;

            const friend = JSON.parse(friendResult) as User

            return friend;
        })
    )

    return friends;
}