document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info');
    const loginMenu = document.querySelector('[data-netlify-identity-menu]');
    
    // SaaS Hub nişanını əlavə edirik (sən istədiyin kimi)
    const saasHubContainer = document.querySelector('.saashub-badge-container');
    if(saasHubContainer) {
        saasHubContainer.innerHTML = `<a href='https://www.saashub.com/prolingo?utm_source=badge' target='_blank'><img src="https://cdn-b.saashub.com/img/badges/approved-dark.png?v=1" alt="ProLingo badge" style="max-width: 150px; margin-top: 30px;"/></a>`;
    }

    const updateUserStatus = (user) => {
        if (user) {
            userInfoDiv.innerHTML = `<p>Xoş gəldin, ${user.email}!</p><button id="logout-button">Çıxış</button>`;
            loginMenu.style.display = 'none';
            document.getElementById('logout-button').addEventListener('click', () => {
                netlifyIdentity.logout();
            });
        } else {
            userInfoDiv.innerHTML = '';
            loginMenu.style.display = 'block';
        }
    };

    netlifyIdentity.on('init', user => updateUserStatus(user));
    netlifyIdentity.on('login', user => {
        updateUserStatus(user);
        netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => updateUserStatus(null));

    if (window.netlifyIdentity) {
        window.netlifyIdentity.init();
    }
});