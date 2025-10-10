'use server'
'use server' // This tells Next.js that these functions run on the server side, not in the browser

import { auth } from "@/auth"      // Importing authentication functionality from Next.js
import { db } from "@/lib/db"      // Importing database connection (likely Prisma DB)

// Function to get a user from the database by their ID
export const getUserById=async(id:any)=>{
    try {
        // Using Prisma to find a unique user with the given ID
        // Include: true means it will also fetch the user's connected accounts
        const user=await db.user.findUnique({
            where:{id:id},
            include:{
                accounts:true
            }
        })
        return user
    } catch (error) {
        // If something goes wrong, log the error and return null
        console.log('error in index.ts while performinig getuserbyid: ',error)
        return null
    }
}

// Function to get the first account associated with a user ID
export const getAccountByUserId=async(userId:any)=>{
    try {
        // Using Prisma to find the first account that matches the userId
        const account=await db.account.findFirst({
            where:{userId:userId}
        })
        return account
    } catch (error) {
        // If something goes wrong, log the error and return null
        console.log('error in index.ts while performinig getAccountByUserId: ',error)
        return null
    }
}

// Function to get the currently logged-in user
export const currentUser=async()=>{
    // Uses Next.js auth() function to get the current session
    const user = await auth()
    // Returns just the user part of the session
    return user?.user
}