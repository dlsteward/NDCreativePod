// app/api/directory/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { PenpalModel } from '@/models/Penpal';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        // Connect to MongoDB first
        await connectDB();

        const body = await request.json();

        // Validate that at least one exchange type is selected
        const hasExchangeType = Object.values(body.exchangeTypes).some((value: boolean) => value);
        if (!hasExchangeType) {
            return NextResponse.json(
                { success: false, message: 'Please select at least one exchange type' },
                { status: 400 }
            );
        }

        // Create new penpal entry
        const penpal = new PenpalModel(body);
        await penpal.save();

        return NextResponse.json(
            { 
                success: true, 
                message: 'Successfully joined the penpal directory!',
                data: penpal 
            },
            { status: 201 }
        );

    } catch (error) {
        // Handle validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Validation error occurred',
                    error: error.message 
                },
                { status: 400 }
            );
        }

        // Handle other errors
        console.error('Error in POST /api/directory:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error submitting form',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}