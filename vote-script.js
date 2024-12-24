async function vote(first) {
    if (document.body.innerHTML.length === 0) {
        console.log("Empty body, returning...");
        return;
    }

    if (document.querySelector('.alert.alert-success')) {
        console.log("Vote already successful.");
        return;
    }

    // Handle reCAPTCHA if present
    if (document.querySelector('.g-recaptcha')) {
        try {
            const iframe = document.querySelector('iframe[src*="recaptcha"]');
            if (iframe) {
                const recaptchaFrame = iframe.contentWindow;
                const checkbox = recaptchaFrame.document.querySelector('.recaptcha-checkbox');
                if (checkbox) {
                    checkbox.click();  // Clicking the checkbox
                    console.log("reCAPTCHA checkbox clicked.");
                    return;
                }
            }
        } catch (error) {
            console.error("Error interacting with reCAPTCHA: ", error);
        }
    }

    // Handle possible errors and alerts
    if (document.querySelector('.alert.alert-primary') && document.querySelector('.alert.alert-primary').textContent.includes('reCaptcha')) {
        console.log("Detected reCAPTCHA, solving...");
        // Reattempt logic or custom solving solution can be added here.
        return;
    }

    // Ensure GDPR is accepted
    if (document.querySelector('#gdpr') && !document.querySelector('#gdpr').checked) {
        document.querySelector('#gdpr').checked = true;
        console.log("GDPR consent given.");
    }

    // Fill out the nickname and vote
    const project = await getProject();
    document.querySelector('input[name="username"]').value = project.nick;

    // Submit the vote
    const voteButton = document.querySelector('div.vote__box__buttonRow__button button[type="submit"]');
    if (voteButton) {
        voteButton.click();
        console.log("Vote submitted.");
    }
}
