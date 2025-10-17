import { Request, Response } from 'express';
import { z } from 'zod';
import { sendTeacherCredentialsEmail } from '../services/teacherCredentialsEmail';

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6)
});

export async function sendTeacherCredentialsEmailController(req: Request, res: Response) {
  try {
    // Only allow internal requests
    if (req.headers['x-internal-request'] !== 'true') {
      res.status(403).json({
        success: false,
        error: { message: 'Forbidden: Internal requests only' },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid request', details: parse.error.issues },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const { email, username, password } = parse.data;
    await sendTeacherCredentialsEmail(email, username, password);
    res.status(200).json({ success: true, message: 'Teacher credentials email sent.' });
    return;
  } catch (error) {
    console.error('Failed to send teacher credentials email:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' }, timestamp: new Date().toISOString() });
    return;
  }
}
