import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/User';

export async function POST(request: Request) {
  await dbConnect();
  
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid JSON payload', success: false }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { username, content } = requestBody;

  if (!username || !content) {
    return new Response(
      JSON.stringify({ message: 'Username and content are required', success: false }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found', success: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (user.isAcceptingMessages === false) {
      return new Response(
        JSON.stringify({ message: 'User is not accepting messages', success: false }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    if (!Array.isArray(user.messages)) {
      return new Response(
        JSON.stringify({ message: 'User messages field is invalid', success: false }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    user.messages.push(newMessage as Message);
    await user.save();

    return new Response(
      JSON.stringify({ message: 'Message sent successfully', success: true }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', success: false }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
