// <== OTP PURPOSE TYPE ==>
export type OtpPurpose =
  | "phone_change"
  | "password_change"
  | "email_change_new"
  | "email_change_current";

// <== EMAIL CHANGE STAGE TYPE ==>
export type EmailChangeStage = "idle" | "current" | "new";

// <== USER PROFILE TYPE ==>
export type UserProfile = {
  // <== MONGODB USER ID ==>
  id: string;
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== OPTIONAL PHONE NUMBER ==>
  phoneNumber: string | null;
  // <== OPTIONAL ADDRESS ==>
  address: string | null;
  // <== OPTIONAL CLOUDINARY AVATAR ==>
  avatar: { url: string; publicId: string } | null;
  // <== MILK RATE PER LITER ==>
  milkRate: number;
  // <== YOGHURT RATE PER KG ==>
  yoghurtRate: number;
  // <== DAILY REPORTS ENABLED FLAG ==>
  dailyReportsEnabled: boolean;
  // <== MONTHLY REPORTS ENABLED FLAG ==>
  monthlyReportsEnabled: boolean;
};

// <== GENERIC API RESPONSE WRAPPER ==>
export type ApiResponse<T> = {
  // <== SUCCESS FLAG ==>
  success: boolean;
  // <== SERVER MESSAGE ==>
  message: string;
  // <== RESPONSE PAYLOAD ==>
  data: T;
};

// <== API ERROR RESPONSE TYPE ==>
export type ApiErrorResponse = {
  // <== SERVER ERROR CODE ==>
  code?: string;
  // <== ERROR MESSAGE ==>
  message?: string;
  // <== SUCCESS FLAG ==>
  success?: boolean;
};
