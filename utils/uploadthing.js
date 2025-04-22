// uploadthing.js
import { UTApi } from "uploadthing/server";


const uploadthingsecret = process.env.UPLOADTHING_SECRET || "teststring"

export const utapi = new UTApi({
  apiKey: uploadthingsecret,
})

