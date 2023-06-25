"use client"

import { Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ButtonHTMLAttributes, FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from './ui/Button'

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement>{};

const SignOutButton:FC<IProps> = ({ ...props }) => {
    const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

    return <Button {...props} variant='ghost' onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut()
        } catch (error) {
          toast.error('There was a problem signing out')
        } finally {
          setIsSigningOut(false)
        }
    }}>
        {isSigningOut ? <Loader2 className='animate-spin h-5 x-5' /> : <LogOut className='w-5 h-5'/>}
    </Button>
};

export default SignOutButton;