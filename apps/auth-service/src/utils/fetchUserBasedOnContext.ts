export async function fetchUserByUsernameAndContext(prisma: any, username: string, context: string, subdomain?: string) {
  let user;

  if (context === 'platform') {
    user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.role !== 'ADMIN') {
      throw new Error('The role must be ADMIN for platform context');
    }
  } else if (context === 'school') {
    user = await prisma.user.findFirst({
      where: { username, subdomain },
    });
    if (!user) {
      const usernameWithSubdomain = `${username}@${subdomain}`;
      user = await prisma.user.findFirst({
        where: { username: usernameWithSubdomain },
      });
      if (!user) {
        throw new Error('User not found');
      }
    }
  } else {
    throw new Error('Invalid context');
  }

  if (!user.isActive) {
    throw new Error('User is not active');
  }
  if (!user.isPhoneVerified) {
    throw new Error('Phone number not verified');
  }

  return user;
}
