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
        return;
    }

    // Ensure GDPR is accepted
    if (document.querySelector('#gdpr') && !document.querySelector('#gdpr').checked) {
        document.querySelector('#gdpr').checked = true;
        console.log("GDPR consent given.");
    }

    // Manually set the username (if not using getProject)
    document.querySelector('input[name="username"]').value = "YourUsernameHere";  // Replace with desired username

    // Submit the vote
    const voteButton = document.querySelector('div.vote__box__buttonRow__button button[type="submit"]');
    if (voteButton) {
        voteButton.click();
        console.log("Vote submitted.");
    }

    // Wait for the page to update after the vote is cast
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for the page to reload or display message

    // Check for success message
    const successMessage = document.querySelector('.alert.alert-success');
    if (successMessage) {
        console.log("Vote successful: " + successMessage.textContent);
        return;
    }

    // Check for 'already voted' message
    const alreadyVotedMessage = document.querySelector('.alert.alert-danger');
    if (alreadyVotedMessage && alreadyVotedMessage.textContent.includes('You have already voted')) {
        console.log("Already voted.");
        return;
    }

    // If neither, manually inspect the page for confirmation or errors
    console.log("Vote result unclear. Check page for success/error messages.");
}

