

async function loadUserData() {
    try {
        console.log('[Debug] Starting loadUserData');
        
        const response = await fetch('https://bebetter-fivem.space/api/getUserData', {
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('[Debug] API response not OK, status:', response.status);
            window.location.href = 'login';
            return;
        }

        const data = await response.json();
        console.log('[Debug] API response data:', data);

        // Sprawdzenie wymaganej zmiany hasÅ‚a z debugowaniem
        if (data.requiresPasswordChange) {
            console.log('[Debug] Password change required, showing notification');
            setTimeout(() => {
                showPasswordChangeNotification();
                console.log('[Debug] Notification should be visible now');
            }, 500); // MaÅ‚e opÃ³Åºnienie dla pewnoÅ›ci
        } else {
            console.log('[Debug] No password change required');
        }

        // Aktualizacja UI
        console.log('[Debug] Updating UI elements');
        document.getElementById('username').textContent = data.username;
        document.getElementById('uid').textContent = data.uid;
        
        // Aktualizacja odznak
        const badgeElements = document.querySelectorAll('.badge, .profile-badge.rank');
        badgeElements.forEach(el => {
            el.textContent = data.badge;
            el.setAttribute('data-rank', data.badge);
        });

        // Aktualizacja awatara
        const avatarContainer = document.querySelector('.avatar');
        if (avatarContainer) {
            avatarContainer.innerHTML = '';
            
            const avatarImg = document.createElement('img');
            avatarImg.className = 'discord-avatar-img';
            avatarImg.alt = 'Discord Avatar';
            
            if (data.discordId && data.discordAvatar) {
                avatarImg.src = `https://cdn.discordapp.com/avatars/${data.discordId}/${data.discordAvatar}.png?size=128`;
                avatarImg.onerror = function() {
                    console.log('[Debug] Discord avatar load failed, using fallback');
                    this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                };
            } else {
                console.log('[Debug] No discord avatar available, using default');
                avatarImg.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }
            
            avatarContainer.appendChild(avatarImg);
        }

        // Aktualizacja nazwy uÅ¼ytkownika
        const profileUsername = document.getElementById('profile-username');
        if (profileUsername) {
            profileUsername.innerHTML = '';
            const mainName = document.createTextNode(data.username + ' ');
            profileUsername.appendChild(mainName);
            
            if (data.discordUsername) {
                const discordTag = document.createElement('span');
                discordTag.className = 'discord-tag';
                discordTag.textContent = `(${data.discordUsername})`;
                profileUsername.appendChild(discordTag);
            }
        }

        // ObsÅ‚uga panelu admina
        if (data.adminLevel > 0) {
            console.log('[Debug] User is admin, level:', data.adminLevel);
            document.getElementById('adminNavItem').style.display = 'flex';
            document.getElementById('adminBadge').textContent = data.badge;
            document.getElementById('adminBadge').setAttribute('data-rank', data.badge);
        }
        
        // Aktualizacja sekcji Discord
        console.log('[Debug] Updating Discord section');
        updateDiscordSection(data);

    } catch (error) {
        console.error('[Debug] Error in loadUserData:', error);
        // MoÅ¼esz dodaÄ‡ tymczasowe powiadomienie dla uÅ¼ytkownika
        alert('Error loading user data. Please try again or contact support.');
    }
}

function showPasswordChangeNotification() {
    console.log('[Debug] Creating password change notification');

    // Najpierw usuÅ„ istniejÄ…ce elementy (jeÅ›li istniejÄ…)
    const existingElements = ['passwordChangeNotification', 'blurOverlay', 'passwordChangeModal'];
    existingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
    });

    // UtwÃ³rz overlay
    const overlay = document.createElement('div');
    overlay.id = 'blurOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; 
        left: 0;
        width: 100vw; 
        height: 100vh;
        backdrop-filter: blur(5px);
        background: rgba(15, 15, 19, 0.7);
        z-index: 999;
    `;
    document.body.appendChild(overlay);

    // UtwÃ³rz powiadomienie
    const notification = document.createElement('div');
    notification.id = 'passwordChangeNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(90deg, rgba(177, 74, 255, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        animation: slideIn 0.3s ease-out;
        border: 1px solid rgba(138, 43, 226, 0.3);
        backdrop-filter: blur(8px);
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="color: #b14aff;"></i>
            <span>You must change your password to continue using the panel</span>
            <button id="changePasswordBtn" style="
                margin-left: 15px; 
                padding: 8px 16px; 
                background: linear-gradient(90deg, #8a2be2 0%, #5e17eb 100%);
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                box-shadow: 0 4px 6px -1px rgba(138, 43, 226, 0.2);
            ">
                Change Password
            </button>
        </div>
    `;
    document.body.appendChild(notification);

    // ObsÅ‚uga klikniÄ™cia w "Change Password"
    const btn = document.getElementById('changePasswordBtn');
    if (btn) {
        btn.addEventListener('click', function() {
            console.log('[Debug] Change password button clicked');
            notification.remove();
            showPasswordChangeModal();
        });
        
        // Efekt hover
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'linear-gradient(90deg, #7928ca 0%, #5312d6 100%)';
            btn.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'linear-gradient(90deg, #8a2be2 0%, #5e17eb 100%)';
            btn.style.transform = 'translateY(0)';
        });
    }
}

function showPasswordChangeModal() {
    console.log('[Debug] Showing password change modal');

    // UtwÃ³rz overlay
    const blurOverlay = document.createElement('div');
    blurOverlay.id = 'blurOverlay';
    blurOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(5px);
        background-color: rgba(15, 15, 19, 0.8);
        z-index: 1000;
    `;
    document.body.appendChild(blurOverlay);

    // UtwÃ³rz modal
    const modal = document.createElement('div');
    modal.id = 'passwordChangeModal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(17, 17, 27, 0.9) 0%, rgba(24, 24, 36, 0.9) 100%);
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        min-width: 350px;
        max-width: 90%;
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
        border: 1px solid rgba(138, 43, 226, 0.3);
        backdrop-filter: blur(8px);
    `;

    modal.innerHTML = `
        <h2 style="margin: 0; color: #b14aff; background: linear-gradient(90deg, #b14aff 0%, #8a2be2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Change Password
        </h2>
        <div style="width: 100%;">
            <input type="password" id="modalNewPassword" placeholder="New Password" style="
                width: 100%; 
                padding: 12px; 
                background: rgba(31, 41, 55, 0.5);
                border: 1px solid #374151;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                margin-bottom: 15px;
                transition: all 0.2s;
            ">
            <input type="password" id="modalConfirmNewPassword" placeholder="Confirm New Password" style="
                width: 100%; 
                padding: 12px; 
                background: rgba(31, 41, 55, 0.5);
                border: 1px solid #374151;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                transition: all 0.2s;
            ">
            <div id="errorMessage" style="color: #ff6b6b; font-size: 14px; min-height: 18px; margin-top: 10px;"></div>
        </div>
        <button id="submitPasswordChange" style="
            padding: 12px 24px; 
            background: linear-gradient(90deg, #8a2be2 0%, #5e17eb 100%);
            color: white; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            box-shadow: 0 4px 10px rgba(138, 43, 226, 0.3);
            width: 100%;
        ">
            Submit
        </button>
    `;

    document.body.appendChild(modal);

    // Efekty hover i focus dla inputÃ³w
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#8a2be2';
            input.style.boxShadow = '0 0 0 2px rgba(138, 43, 226, 0.25)';
            input.style.background = 'rgba(31, 41, 55, 0.7)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#374151';
            input.style.boxShadow = 'none';
            input.style.background = 'rgba(31, 41, 55, 0.5)';
        });
    });

    const submitBtn = document.getElementById('submitPasswordChange');
    const errorMessage = document.getElementById('errorMessage');

    // Efekt hover dla przycisku
    submitBtn.addEventListener('mouseenter', () => {
        submitBtn.style.background = 'linear-gradient(90deg, #7928ca 0%, #5312d6 100%)';
        submitBtn.style.transform = 'translateY(-2px)';
    });
    submitBtn.addEventListener('mouseleave', () => {
        submitBtn.style.background = 'linear-gradient(90deg, #8a2be2 0%, #5e17eb 100%)';
        submitBtn.style.transform = 'translateY(0)';
    });

    submitBtn.addEventListener('click', async () => {
        const newPassword = document.getElementById('modalNewPassword').value.trim();
        const confirmNewPassword = document.getElementById('modalConfirmNewPassword').value.trim();
    
        errorMessage.textContent = '';
    
        if (!newPassword || !confirmNewPassword) {
            errorMessage.textContent = 'Fill in both fields.';
            return;
        }
        if (newPassword !== confirmNewPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }
        if (newPassword.length < 3) {
            errorMessage.textContent = 'Password must be at least 3 characters.';
            return;
        }
    
        try {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.textContent = 'Processing...';
            
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: 'test',
                    newPassword,
                    confirmNewPassword
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Animacja sukcesu
                submitBtn.style.background = 'linear-gradient(90deg, #34d399 0%, #10b981 100%)';
                submitBtn.textContent = 'Success!';
                
                setTimeout(() => {
                    blurOverlay.remove();
                    modal.remove();
                    window.location.href = '/login';
                }, 1000);
            } else {
                errorMessage.textContent = data.message || 'Something went wrong.';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.textContent = 'Submit';
            }
        } catch (error) {
            console.error('Error changing password:', error);
            errorMessage.textContent = 'Server error.';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.textContent = 'Submit';
        }
    });
}


function updateDiscordSection(userData) {
    const discordAvatar = document.getElementById('discordAvatar');
    const discordUsername = document.getElementById('discordUsername');
    const discordId = document.getElementById('discordId');
    
    if (userData.discordId) {
        discordUsername.textContent = userData.discordUsername || 'Discord Account Linked';
        discordId.textContent = `Discord ID: ${userData.discordId}`;
        
        discordAvatar.innerHTML = '';
        const avatarImg = document.createElement('img');
        avatarImg.className = 'discord-avatar-img';
        avatarImg.alt = 'Discord Avatar';
        
        if (userData.discordAvatar) {
            avatarImg.src = `https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.discordAvatar}.png?size=128`;
            avatarImg.onerror = function() {
                this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
            };
        } else {
            avatarImg.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
        
        discordAvatar.appendChild(avatarImg);
    } else {
        discordUsername.textContent = 'Not linked';
        discordId.textContent = 'Discord ID: Not linked';
        discordAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
}

async function checkBanStatus() {
 try {
     const response = await fetch('https://bebetter-fivem.space/api/getUserData', {
         credentials: 'include'
     });
     
     if (!response.ok) return;
     
     const userData = await response.json();
     

     if (userData.banned) {
         showBanOverlay(userData.banInfo);
     }
 } catch (error) {
     console.error('Error checking ban status:', error);
 }
}

function showBanOverlay(banInfo) {

 const overlay = document.createElement('div');
 overlay.className = 'ban-overlay';
 

 const bannedDate = banInfo.banned_at ? new Date(banInfo.banned_at).toLocaleString() : 'Unknown date';
 

 overlay.innerHTML = `
     <div class="ban-popup">
         <h2><i class="fas fa-ban"></i> ACCOUNT BANNED</h2>
         
         <div class="ban-reason">
             <p><strong>Reason:</strong> ${banInfo.banned_reason}</p>
         </div>
         
         <div class="ban-details">
             <p><strong>Banned by:</strong> ${banInfo.banned_by}</p>
             <p><strong>Date:</strong> ${bannedDate}</p>
         </div>
         
         <p>Your account has been banned from BEBETTER.</p>
         
     </div>
 `;
 

 document.body.appendChild(overlay);
 

 document.body.style.overflow = 'hidden';
 

 document.querySelector('.main-content').style.display = 'none';
 document.querySelector('.sidebar').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', function() {
 checkBanStatus();
});


function maskData(data, visibleChars = 4) {
if (!data) return 'Not available';
const str = String(data);
return str.length <= visibleChars ? str : 
 str.slice(0, visibleChars) + '*'.repeat(str.length - visibleChars);
}



function initializeAdminPanel() {
 if (!document.getElementById('admin')) return;
 

 const searchBtn = document.getElementById('adminSearchBtn');
 const searchInput = document.getElementById('adminSearchInput');
 const userTableBody = document.getElementById('userTableBody');
 const adminActions = document.getElementById('adminActions');
 const resetHwidBtn = document.getElementById('resetHwidBtn');
 const changeRoleBtn = document.getElementById('changeRoleBtn');
 const deleteUserBtn = document.getElementById('deleteUserBtn');
 const roleSelection = document.getElementById('roleSelection');
 const confirmRoleChange = document.getElementById('confirmRoleChange');
 const prevPageBtn = document.getElementById('prevPageBtn');
 const nextPageBtn = document.getElementById('nextPageBtn');
 const pageInfo = document.getElementById('pageInfo');
 const selectedUsernameSpan = document.getElementById('selectedUsername');
 

 let selectedUser = null;
 let currentUserRole = 0;
 let currentPage = 1;
 let totalPages = 1;
 let currentQuery = '';
 let isLoading = false;



async function banUser() {
if (!selectedUser) return;

const reason = prompt('Enter ban reason:');
if (!reason) return;

try {
 const response = await fetch('https://bebetter-fivem.space/api/admin/ban-user', {
   method: 'POST',
   credentials: 'include',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
     uid: selectedUser.uid,
     reason: reason
   })
 });

 if (!response.ok) throw new Error(await response.text());
 await loadUserDetails(selectedUser.uid);
 alert('User banned successfully!');
 
} catch (error) {
 console.error('Ban error:', error);
 alert('Failed to ban user: ' + error.message);
}
}


async function unbanUser() {
if (!selectedUser || !confirm(`Unban ${selectedUser.username}?`)) return;

try {
 const response = await fetch('https://bebetter-fivem.space/api/admin/unban-user', {
   method: 'POST',
   credentials: 'include',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ uid: selectedUser.uid })
 });

 if (!response.ok) throw new Error(await response.text());
 await loadUserDetails(selectedUser.uid);
 alert('User unbanned successfully!');
 
} catch (error) {
 console.error('Unban error:', error);
 alert('Failed to unban user: ' + error.message);
}
}


document.getElementById('banUserBtn').addEventListener('click', banUser);
document.getElementById('unbanUserBtn').addEventListener('click', unbanUser);

async function resetUserPassword() {
    if (!selectedUser || !confirm(`Reset password for ${selectedUser.username}?\n\nUser will be required to set new password on next login.`)) return;

    try {
        const response = await fetch('https://bebetter-fivem.space/api/admin/reset-password', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: selectedUser.uid })
        });

        if (!response.ok) throw new Error(await response.text());
        
        alert('Password reset successfully! User will be prompted to set new password on next login.');
    } catch (error) {
        console.error('Password reset error:', error);
        alert('Failed to reset password: ' + error.message);
    }
}

// Dodaj nasÅ‚uchiwanie przycisku
document.getElementById('resetPasswordBtn').addEventListener('click', resetUserPassword);

 async function checkPermissions() {
     try {
         const response = await fetch('https://bebetter-fivem.space/api/getUserData', {
             credentials: 'include'
         });
         
         if (!response.ok) return { adminLevel: 0 };
         
         const data = await response.json();
         return {
             adminLevel: data.adminLevel || 0
         };
     } catch (error) {
         console.error('Error checking permissions:', error);
         return { adminLevel: 0 };
     }
 }


 async function fetchUsers(query = '', page = 1) {
     if (isLoading) return;
     isLoading = true;
     
     try {
         const response = await fetch(
             `https://bebetter-fivem.space/api/admin/users?query=${encodeURIComponent(query)}&page=${page}&limit=5`, 
             {
                 credentials: 'include'
             }
         );
         
         if (!response.ok) throw new Error('Failed to fetch users');
         
         const { users, total } = await response.json();
         return { users, total };
     } catch (error) {
         console.error('Error fetching users:', error);
         throw error;
     } finally {
         isLoading = false;
     }
 }


 async function searchUsers(query = '', page = 1) {
     try {

         currentQuery = query;
         currentPage = page;
         userTableBody.innerHTML = '<tr><td colspan="4" class="loading">Loading users...</td></tr>';
         const { users, total } = await fetchUsers(query, page);
         totalPages = Math.ceil(total / 5);
         renderUserTable(users);
         updatePaginationControls();
         if (users.length === 0) {
             adminActions.style.display = 'none';
         }
     } catch (error) {
         userTableBody.innerHTML = '<tr><td colspan="4" class="error">Failed to load users</td></tr>';
         console.error('Error searching users:', error);
     }
 }


 function renderUserTable(users) {
 userTableBody.innerHTML = '';
 
 if (users.length === 0) {
     userTableBody.innerHTML = '<tr><td colspan="4" class="no-users">No users found</td></tr>';
     return;
 }
 
 users.forEach(user => {
     const row = document.createElement('tr');
     row.dataset.uid = user.uid;
     row.dataset.username = user.username;
     row.dataset.role = user.admin;
     

     if (user.banned) {
         row.classList.add('banned-row');
     }
     
     row.innerHTML = `
         <td class="uid-cell">${user.uid}</td>
         <td>
             ${user.username}
             ${user.banned ? '<span class="banned-badge">BANNED</span>' : ''}
         </td>
         <td>${getBadgeText(user.admin)}</td>
         <td><button class="btn btn-primary btn-select">Select</button></td>
     `;
     
     userTableBody.appendChild(row);
 });
 
 addSelectListeners();
}


 function addSelectListeners() {
     document.querySelectorAll('.btn-select').forEach(btn => {
         btn.addEventListener('click', function() {
             const row = this.closest('tr');
             selectUser(row);
         });
     });
 }

 function updatePaginationControls() {
     pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
     prevPageBtn.disabled = currentPage <= 1;
     nextPageBtn.disabled = currentPage >= totalPages;
     

     document.querySelector('.pagination').style.display = totalPages <= 1 ? 'none' : 'flex';
 }


 async function selectUser(row) {
 try {

     const uid = String(row.dataset.uid);
     console.log(`Selecting user with UID: ${uid} (type: ${typeof uid})`);
     

     document.querySelectorAll('.user-table tr').forEach(r => {
         r.classList.remove('selected');
     });
     

     row.classList.add('selected');
     

     selectedUser = {
         uid: uid,
         username: row.dataset.username,
         role: parseInt(row.dataset.role)
     };
     
     document.getElementById('selectedUsername').textContent = selectedUser.username || 'Unknown';
     document.getElementById('adminActions').style.display = 'block';
     

     await loadUserDetails(uid);
     

     const { adminLevel } = await checkPermissions();
     currentUserRole = adminLevel;
     
     //HELPER (1)
     //TYLKO PRZEGLADANIE

     // OD SUPPORT (2)
     document.getElementById('resetHwidBtn').style.display = adminLevel >= 2 ? 'block' : 'none'; 

     // OD MODERATOR (3)
     document.getElementById('resetPasswordBtn').style.display = adminLevel >= 3 ? 'block' : 'none';  

     // OD ADMIN (4)
     document.getElementById('banUserBtn').style.display = adminLevel >= 4 ? 'block' : 'none';  

     // OD STAFF (5)
     document.getElementById('unbanUserBtn').style.display = adminLevel >= 5 ? 'block' : 'none';
     
     // OD OWNER (6)
     document.getElementById('changeRoleBtn').style.display = adminLevel >= 6 ? 'block' : 'none';
     document.getElementById('deleteUserBtn').style.display = adminLevel >= 6 ? 'block' : 'none'; 
     

      
       
     
 } catch (error) {
     console.error('Error in selectUser:', error);
 }
}

async function loadUserDetails(uid) {
try {
 const response = await fetch(`https://bebetter-fivem.space/api/admin/user-details?uid=${encodeURIComponent(uid)}`, {
   credentials: 'include'
 });

 if (!response.ok) throw new Error('Failed to load user details');
 const { data: user } = await response.json();


 document.getElementById('userHwid').textContent = user.hwid ? maskData(user.hwid) : 'Not set';
 document.getElementById('userIp').textContent = user.ip ? maskData(user.ip) : 'Not available';
 document.getElementById('userDiscordId').textContent = user.discord_id || 'Not linked';
 document.getElementById('userCreatedAt').textContent = user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown';


 const banDetailsSection = document.getElementById('banDetails');
 const isBanned = user.banned;

 if (isBanned) {

   banDetailsSection.style.display = 'block';
   document.getElementById('userBanned').textContent = 'Yes';
   document.getElementById('userBannedBy').textContent = user.banned_by || 'System';
   document.getElementById('userBannedAt').textContent = user.banned_at ? new Date(user.banned_at).toLocaleString() : 'Unknown';
   document.getElementById('userBannedReason').textContent = user.banned_reason || 'No reason provided';
   

   banDetailsSection.classList.add('banned-user');
 } else {

   banDetailsSection.style.display = 'none';
 }



} catch (error) {
 console.error('Error loading user details:', error);

 document.getElementById('banDetails').style.display = 'none';
 alert('Failed to load user details');
}
}


 async function resetUserHwid() {
     if (!selectedUser) return;
     
     try {
         const response = await fetch('https://bebetter-fivem.space/api/admin/reset-hwid', {
             method: 'POST',
             credentials: 'include',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 uid: selectedUser.uid
             })
         });
         
         if (!response.ok) throw new Error(await response.text());
         
         alert('HWID reset successfully!');

         searchUsers(currentQuery, currentPage);
     } catch (error) {
         console.error('Error resetting HWID:', error);
         alert(`Failed to reset HWID: ${error.message}`);
     }
 }


 async function changeUserRole() {
     if (!selectedUser) return;
     
     const newRole = parseInt(document.getElementById('roleSelect').value);
     
     if (newRole === selectedUser.role) {
         roleSelection.style.display = 'none';
         return;
     }
     
     if (newRole >= currentUserRole) {
         alert('You cannot assign a role equal or higher than your own!');
         return;
     }
     
     try {
         const response = await fetch('https://bebetter-fivem.space/api/admin/change-role', {
             method: 'POST',
             credentials: 'include',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 uid: selectedUser.uid,
                 newRole: newRole
             })
         });
         
         if (!response.ok) throw new Error(await response.text());
         
         alert('Role changed successfully!');
         roleSelection.style.display = 'none';

         searchUsers(currentQuery, currentPage);
     } catch (error) {
         console.error('Error changing role:', error);
         alert(`Failed to change role: ${error.message}`);
     }
 }


 async function deleteUser() {
     if (!selectedUser) return;
     
     try {
         const response = await fetch('https://bebetter-fivem.space/api/admin/delete-user', {
             method: 'POST',
             credentials: 'include',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 uid: selectedUser.uid
             })
         });
         
         if (!response.ok) throw new Error(await response.text());
         
         alert('User deleted successfully!');

         selectedUser = null;
         adminActions.style.display = 'none';

         searchUsers(currentQuery, currentPage);
     } catch (error) {
         console.error('Error deleting user:', error);
         alert(`Failed to delete user: ${error.message}`);
     }
 }


 searchBtn.addEventListener('click', () => {
     searchUsers(searchInput.value.trim(), 1);
 });
 
 searchInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
         searchUsers(searchInput.value.trim(), 1);
     }
 });
 
 prevPageBtn.addEventListener('click', () => {
     if (currentPage > 1) {
         searchUsers(currentQuery, currentPage - 1);
     }
 });
 
 nextPageBtn.addEventListener('click', () => {
     if (currentPage < totalPages) {
         searchUsers(currentQuery, currentPage + 1);
     }
 });
 
 resetHwidBtn.addEventListener('click', () => {
     if (selectedUser && confirm(`Are you sure you want to reset HWID for ${selectedUser.username}?`)) {
         resetUserHwid();
     }
 });
 
 changeRoleBtn.addEventListener('click', () => {
     if (selectedUser) {
         document.getElementById('roleSelect').value = selectedUser.role;
         roleSelection.style.display = 'flex';
     }
 });
 
 confirmRoleChange.addEventListener('click', () => {
     if (selectedUser) {
         changeUserRole();
     }
 });
 
 deleteUserBtn.addEventListener('click', () => {
     if (selectedUser && confirm(`WARNING: This will permanently delete ${selectedUser.username}. Are you sure?`)) {
         deleteUser();
     }
 });


 function getBadgeText(adminLevel) {
     switch(adminLevel) {
         case 1: return 'HELPER';
         case 2: return 'SUPPORT';
         case 3: return 'MODERATOR';
         case 4: return 'ADMIN';
         case 5: return 'STAFF';
         case 6: return 'OWNER';
         default: return 'USER';
     }
 }


 searchUsers('', 1);
}





async function logout() {

 const overlay = document.querySelector('.ban-overlay');
 if (overlay) {
     overlay.remove();
     document.body.style.overflow = '';
 }
 
 await fetch('https://bebetter-fivem.space/api/logout', { credentials: 'include' });
 window.location.href = 'login';
}

 function downloadFile() {
     window.location.href = '/api/download';
 }


 document.addEventListener('DOMContentLoaded', function() {

     loadUserData();





     const navItems = document.querySelectorAll('.nav-item');
     const pageSections = document.querySelectorAll('.page-section');

     navItems.forEach(item => {
         item.addEventListener('click', function(e) {
             e.preventDefault();
             

             navItems.forEach(navItem => navItem.classList.remove('active'));
             pageSections.forEach(section => section.classList.remove('active'));
             

             this.classList.add('active');
             

             const page = this.getAttribute('data-page');
             document.getElementById(page).classList.add('active');
         });
     });




     const passwordForm = document.getElementById('passwordChangeForm');
     if (passwordForm) {
 
         document.querySelectorAll('.toggle-password').forEach(button => {
             button.addEventListener('click', function() {
                 const input = this.parentElement.querySelector('input');
                 const icon = this.querySelector('i');
                 const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                 
                 input.setAttribute('type', type);
                 icon.classList.toggle('fa-eye');
                 icon.classList.toggle('fa-eye-slash');
             });
         });


         passwordForm.addEventListener('submit', async function(e) {
             e.preventDefault();
             
      
             document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
             document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
             
         
             const currentPassword = document.getElementById('currentPassword').value;
             const newPassword = document.getElementById('newPassword').value;
             const confirmPassword = document.getElementById('confirmPassword').value;
             
      
             let isValid = true;
             
             if (!currentPassword) {
                 showError('currentPassword', 'Current password is required');
                 isValid = false;
             }
             
             if (!newPassword) {
                 showError('newPassword', 'New password is required');
                 isValid = false;
             }
             
             if (!confirmPassword) {
                 showError('confirmPassword', 'Please confirm your new password');
                 isValid = false;
             } else if (newPassword !== confirmPassword) {
                 showError('confirmPassword', 'Passwords do not match');
                 isValid = false;
             }
             
             if (!isValid) return;
             
             try {
                 const response = await fetch('https://bebetter-fivem.space/api/change-password', {
                     method: 'POST',
                     credentials: 'include',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({
                         currentPassword,
                         newPassword,
                         confirmNewPassword: confirmPassword
                     })
                 });
                 
                 const data = await response.json();
                 
                 if (!response.ok) {
                     throw new Error(data.message || 'Failed to change password');
                 }
                 
                 alert('Password changed successfully!');
                 this.reset();
             } catch (error) {
                 console.error('Password change error:', error);
                 alert(error.message || 'An error occurred while changing password');
             }
         });
     }
     
     
 });



function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    if (field && errorElement) {
        field.closest('.form-group').classList.add('error');
        errorElement.textContent = message;
    }
}


function escapeHtml(unsafe) {
     return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


 document.addEventListener('DOMContentLoaded', function() {
     const navItems = document.querySelectorAll('.nav-item');
     
// ObsÅ‚uga przycisku relinkowania Discord
const relinkBtn = document.getElementById('relinkDiscordBtn');
if (relinkBtn) {
    relinkBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to link a different Discord account?\n\nThis will replace your current linked Discord account.')) {
            window.location.href = '/api/relink-discord';
        }
    });
}

// SprawdÅº parametr URL po relinkowaniu
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('discordRelink') && urlParams.get('discordRelink') === 'success') {
    alert('Your Discord account has been successfully relinked!');
    window.history.replaceState({}, document.title, window.location.pathname);
    loadUserData();
}


 navItems.forEach(item => {
     item.addEventListener('click', function() {
         const page = this.getAttribute('data-page');
         if (page === 'admin') {
             setTimeout(initializeAdminPanel, 100);
         }
     });
 });

 });
