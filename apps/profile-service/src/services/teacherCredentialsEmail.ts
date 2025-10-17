import axios from 'axios';
import config from '../config/config';

export async function sendTeacherCredentialsEmail(email: string, username: string, password: string) {
  // Call the auth-service endpoint to send the email
  await axios.post(
    `${config.services.auth.url}/api/v1/internal/send-teacher-credentials-email`,
    {
      email,
      username,
      password,
    },
    {
      timeout: config.services.auth.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true',
      },
    }
  );
}
