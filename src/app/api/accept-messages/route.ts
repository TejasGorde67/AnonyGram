import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!user._id) {
    return new Response(
      JSON.stringify({ success: false, message: 'User ID is missing' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    if (typeof body.acceptMessages !== 'boolean') {
      throw new Error('Invalid acceptMessages value');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { isAcceptingMessages: body.acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Unable to find user to update message acceptance status',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message acceptance status updated successfully',
        updatedUser,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating message acceptance status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid request body',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!user._id) {
    return new Response(
      JSON.stringify({ success: false, message: 'User ID is missing' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error retrieving message acceptance status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error retrieving message acceptance status',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
