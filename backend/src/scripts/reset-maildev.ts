export async function resetMailDev(): Promise<void> {
  const maildevUrl = process.env.MAILDEV_API_URL || 'http://localhost:1080';
  try {
    const res = await fetch(`${maildevUrl}/email/all`, {
      method: 'DELETE',
    });
    if (res.ok) {
      console.log('  ✔ Cleared all inbox emails from MailDev server');
    } else {
      console.warn(`  ⚠️ MailDev reset response: ${res.status} ${res.statusText}`);
    }
  } catch (err: any) {
    console.warn(`  ⚠️ Could not connect to MailDev on ${maildevUrl}: ${err.message}`);
  }
}

// Allow direct execution
if (require.main === module) {
  resetMailDev()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Failed to reset MailDev:', err);
      process.exit(1);
    });
}
