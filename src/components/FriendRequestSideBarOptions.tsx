"use client"

import React, { FC, useEffect, useState } from "react";
import { User } from 'lucide-react'
import Link from "next/link";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface IProps {
    sessionId: string
    initialUnseenRequestCount: number
};

const FriendRequestSideBarOptions:FC<IProps> = ({
    sessionId,
    initialUnseenRequestCount,
  }) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    );

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

        const friendRequestHandler = () => {
            setUnseenRequestCount(prev => prev + 1)
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
        }
    }, [sessionId]);

    return <Link passHref href='/dashboard/requests' className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
        <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
            <User className='h-6 w-6' />
        </div>
        <p className='truncate'>Friend requests</p>

        {unseenRequestCount > 0 ? (
            <div className='rounded-full w-6 h-6 text-sm flex justify-center items-center text-white bg-indigo-600'>
                {unseenRequestCount}
            </div>
        ) : null}
    </Link>
};

export default FriendRequestSideBarOptions;