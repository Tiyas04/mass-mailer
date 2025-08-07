import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const body = await request.json();
        const { emails, subject, message } = body;

        // Validate required fields
        if (!emails || !subject || !message) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Missing required fields: emails, subject, and message are required'
                }),
                { status: 400 }
            );
        }

        // Validate environment variables
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP environment variables');
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Server configuration error: SMTP credentials not configured'
                }),
                { status: 500 }
            );
        }

        // Parse and validate email addresses
        const emailList = emails.split(',').map(email => email.trim()).filter(email => email.length > 0);

        if (emailList.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No valid email addresses provided'
                }),
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `Invalid email addresses: ${invalidEmails.join(', ')}`
                }),
                { status: 400 }
            );
        }

        // Create transporter using your SMTP provider
        const transporter = nodemailer.createTransport({
            service: 'gmail', // e.g., Gmail, Outlook, or use host/port for custom SMTP
            auth: {
                user: process.env.SMTP_EMAIL, // your email
                pass: process.env.SMTP_PASSWORD // app password (not your normal password)
            }
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('SMTP configuration error:', verifyError);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Email server configuration error. Please check your SMTP settings.'
                }),
                { status: 500 }
            );
        }

        // Send emails to all recipients
        const emailPromises = emailList.map(async (email) => {
            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: email,
                subject: subject,
                text: message,
                html: message.replace(/\n/g, '<br>') // Simple HTML conversion for line breaks
            };

            try {
                await transporter.sendMail(mailOptions);
                return { email, status: 'sent' };
            } catch (emailError) {
                console.error(`Failed to send email to ${email}:`, emailError);
                return { email, status: 'failed', error: emailError.message };
            }
        });

        const results = await Promise.all(emailPromises);

        // Count successful and failed sends
        const successful = results.filter(result => result.status === 'sent');
        const failed = results.filter(result => result.status === 'failed');

        if (failed.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Successfully sent emails to ${successful.length} recipient(s)`,
                    results: results
                }),
                { status: 200 }
            );
        } else if (successful.length > 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Sent to ${successful.length} recipient(s), failed to send to ${failed.length} recipient(s)`,
                    results: results
                }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `Failed to send emails to all ${failed.length} recipient(s)`,
                    results: results
                }),
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Unexpected email error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'An unexpected error occurred while processing your request',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            }),
            { status: 500 }
        );
    }
}
