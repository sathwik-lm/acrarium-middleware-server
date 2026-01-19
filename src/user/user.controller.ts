import { Request, Response } from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { db } from "../utils/db";
import crypto from "crypto";
import { z } from "zod";

const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex");
};

const userValidationSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "VIEWER"], "Invalid role").default("VIEWER"),
});


const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,

    },
});


const sendEmail = async (email: string, password: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Account Login Details",
        text: `Hello,

Your account has been created. Here are your login details:

Email: ${email}
Password: ${password}

Please use this password to log in and change it immediately after the first login.

Best regards,
Your Team`,
    };

    await transporter.sendMail(mailOptions);
};

export const addUser = async (req: Request, res: Response) => {
    const validationResult = userValidationSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", });
    }

    const { email, role } = validationResult.data;

    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await db.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role,
            },
        });

        await sendEmail(email, password);

        res.status(201).json({
            message: "User created successfully and email sent.",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user" });
    }
};


export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await db.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users"});
    }
};

