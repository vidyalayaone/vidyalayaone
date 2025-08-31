import { Response } from 'express';

export async function fetchUserByUsernameAndContext(res: Response, prisma: any, username: string, context: string, schoolId?: string) {
  let user;

  if (context === 'platform') {
    user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }
  } else if (context === 'school') {

    console.log('Fetching user for school context:', { username, schoolId });

    const tempUser = await prisma.user.findUnique({
      where: { username },
    });
    
    console.log('User fetched by username:', tempUser);
    console.log('School ID:', schoolId);
    
    user = await prisma.user.findFirst({
      where: { username, schoolId },
    });
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }
  } else {
    res.status(400).json({
      success: false,
      error: { message: 'Invalid context' },
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({
      success: false,
      error: { message: 'User is not active' },
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!user.isPhoneVerified) {
    res.status(403).json({
      success: false,
      error: { message: 'Phone number not verified' },
      timestamp: new Date().toISOString()
    });
    return;
  }

  return user;
}