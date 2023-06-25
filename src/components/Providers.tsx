'use client'

import React, { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface IProps {
    children: ReactNode
};

const Providers:FC<IProps> = ({children}) => {
    return <>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
    </>
};

export default Providers;