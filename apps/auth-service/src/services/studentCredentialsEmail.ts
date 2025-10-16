import EmailService from './emailService';

export async function sendStudentCredentialsEmail(email: string, username: string, password: string) {
  const subject = 'Your Vidyalayaone Student Account Credentials';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Vidyalayaone!</h2>
      <p>Your student account has been created. Here are your login credentials:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password as soon as possible.</p>
    </div>
  `;
  await EmailService.sendMail(email, subject, html);
}
