import EmailService from './emailService';

export async function sendTeacherCredentialsEmail(email: string, username: string, password: string) {
  const subject = 'Your Vidyalayaone Teacher Account Credentials';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Vidyalayaone!</h2>
      <p>Your teacher account has been created. Here are your login credentials:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password as soon as possible.</p>
      <p>You can now access the teacher portal to manage your classes and students.</p>
    </div>
  `;
  await EmailService.sendMail(email, subject, html);
}
