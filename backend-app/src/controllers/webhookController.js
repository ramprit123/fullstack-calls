import { Webhook } from 'svix';
import User from '../models/User.js';
import { CLERK_WEBHOOK_SECRET } from '../config/env.js';

const webhookSecret = CLERK_WEBHOOK_SECRET;

export async function handleClerkWebhook(req, res) {
  console.log('Webhook received - Headers:', req.headers);
  console.log('Webhook received - Body type:', typeof req.body);
  console.log('Webhook received - Body length:', req.body?.length);

  // Get webhook secret fresh from environment
  const currentWebhookSecret = CLERK_WEBHOOK_SECRET;
  console.log('Webhook secret available:', !!currentWebhookSecret);

  if (!currentWebhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set in environment');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers:', {
      svix_id,
      svix_timestamp,
      svix_signature,
    });
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body - handle both Buffer and string
  let body;
  if (Buffer.isBuffer(req.body)) {
    body = req.body.toString();
  } else if (typeof req.body === 'string') {
    body = req.body;
  } else {
    body = JSON.stringify(req.body);
  }

  console.log('Processing webhook with body length:', body.length);

  // Create a new Svix instance with your secret
  const wh = new Webhook(currentWebhookSecret);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
    console.log('Webhook verification successful');
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    console.error('Headers:', { svix_id, svix_timestamp, svix_signature });
    console.error('Body preview:', body.substring(0, 200));
    console.error('Webhook secret configured:', !!webhookSecret);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the webhook
  const { type, data } = evt;
  console.log(`Received webhook: ${type}`);

  try {
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      case 'session.created':
        await handleSessionCreated(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error handling webhook ${type}:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleUserCreated(data) {
  console.log('Creating user:', data.id);

  const userData = {
    clerkId: data.id,
    email: data.email_addresses[0]?.email_address,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    profileImage: data.profile_image_url,
    role: data.public_metadata?.role || 'user',
  };

  try {
    const user = new User(userData);
    await user.save();
    console.log('User created successfully:', user._id);
  } catch (error) {
    if (error.code === 11000) {
      console.log('User already exists:', data.id);
    } else {
      throw error;
    }
  }
}

async function handleUserUpdated(data) {
  console.log('Updating user:', data.id);

  const updateData = {
    email: data.email_addresses[0]?.email_address,
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    profileImage: data.profile_image_url,
    role: data.public_metadata?.role || 'user',
  };

  await User.findOneAndUpdate({ clerkId: data.id }, updateData, {
    new: true,
    upsert: true,
  });

  console.log('User updated successfully');
}

async function handleUserDeleted(data) {
  console.log('Deleting user:', data.id);

  await User.findOneAndUpdate(
    { clerkId: data.id },
    { isActive: false },
    { new: true }
  );

  console.log('User marked as inactive');
}

async function handleSessionCreated(data) {
  console.log('Session created for user:', data.user_id);

  await User.findOneAndUpdate(
    { clerkId: data.user_id },
    { lastLoginAt: new Date() },
    { new: true }
  );

  console.log('User last login updated');
}
