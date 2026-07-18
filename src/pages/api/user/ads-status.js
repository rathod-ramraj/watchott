// Backend API to check if user should see ads
// This allows dynamic control over ad visibility per user

// Hardcoded list of users who should NOT see ads
// These are premium/admin users who get ad-free experience
const NO_ADS_USERS = [
  'gaurav1000m@gmail.com',
  // Add more emails here as needed
];

// You can also check from environment variable for additional users
const getNoAdsUsers = () => {
  const envUsers = process.env.NO_ADS_USERS?.split(',').map(u => u.trim().toLowerCase()) || [];
  return [...NO_ADS_USERS.map(u => u.toLowerCase()), ...envUsers];
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get user info from query
    const { email } = req.query;
    
    // For POST requests, check body
    const bodyEmail = req.body?.email;
    const userEmail = (email || bodyEmail || '').toLowerCase().trim();

    // Check if user is in no-ads list
    const noAdsList = getNoAdsUsers();
    const shouldHideAds = noAdsList.includes(userEmail);

    // Log for debugging (remove in production if needed)
    console.log(`Ad status check for ${userEmail}: showAds=${!shouldHideAds}`);

    return res.status(200).json({
      success: true,
      showAds: !shouldHideAds,
      isPremium: shouldHideAds,
      userEmail: userEmail || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in ads-status API:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check ad status',
      showAds: true // Default to showing ads on error
    });
  }
}
