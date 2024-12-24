async function vote(first) {
    // Check if the body is empty
    if (document.body.innerHTML.length === 0) {
        console.log("Empty body, returning...");
        return;
    }

    // Check if the vote was already successful
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

    // Check for reCAPTCHA alert
    if (document.querySelector('.alert.alert-primary') && document.querySelector('.alert.alert-primary').textContent.includes('reCaptcha')) {
        console.log("Detected reCAPTCHA, solving...");
        return;
    }

    // Ensure GDPR is accepted
    const gdprCheckbox = document.querySelector('#gdpr');
    if (gdprCheckbox && !gdprCheckbox.checked) {
        gdprCheckbox.checked = true;
        console.log("GDPR consent given.");
    }

    // Set the username (replace "YourUsernameHere" with the desired username)
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput) {
        usernameInput.value = "YourUsernameHere";
        console.log("Username set.");
    } else {
        console.log("Username input not found.");
        return;
    }

    // Submit the vote
    const voteButton = document.querySelector('div.vote__box__buttonRow__button button[type="submit"]');
    if (voteButton) {
        voteButton.click();
        console.log("Vote submitted.");
    } else {
        console.log("Vote button not found.");
        return;
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
} confirmation or errors
    console.log("Vote result unclear. Check page for success/error messages.");
}

