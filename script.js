// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection to Supabase
(async () => {
    try {
        const { data, error } = await supabaseClient.from('course').select('*').limit(1);
        
        if (error) {
            console.error('Error connecting to Supabase:', error);
        } else {
            console.log('Connected to Supabase successfully!');
        }
    } catch (err) {
        console.error('Error:', err);
    }
})();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation active state
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation.split('/').pop()) {
            link.classList.add('active');
        }
    });

    // Check if user is logged in
    checkAuthState();
    
    // Handle logout
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });

    // Handle registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Load courses if on courses page
    const coursesList = document.getElementById('courses-list');
    if (coursesList) {
        loadCourses();

        // Handle course search
        const courseSearch = document.getElementById('course-search');
        if (courseSearch) {
            courseSearch.addEventListener('input', handleCourseSearch);
        }
    }

    // Load courses on homepage
    const homeCoursesList = document.getElementById('home-courses-list');
    if (homeCoursesList) {
        loadHomepageCourses();
    }

    // Handle course enrollment
    const enrollmentForm = document.getElementById('enrollment-form');
    if (enrollmentForm) {
        loadCoursesForEnrollment();
        enrollmentForm.addEventListener('submit', handleCourseEnrollment);
    }
    
    // Lecturer dashboard functionality
    if (document.querySelector('.dashboard') && currentLocation.includes('lecturer_dashboard')) {
        // Initialize the lecturer dashboard
        initLecturerDashboard();
    }
    
    // Officer dashboard functionality
    if (document.querySelector('.dashboard') && currentLocation.includes('officer_dashboard')) {
        // Initialize the officer dashboard
        initOfficerDashboard();
    }
    
    // Initialize modals
    initModals();
});

// Authentication Functions
async function handleRegistration(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const address = document.getElementById('address')?.value || '';
    
    try {
        // Register the user with Supabase auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (authError) {
            throw authError;
        }

        // Generate a random student ID 
        const studentId = Math.floor(10000 + Math.random() * 90000);

        // Insert user data into student2 table
        const { data: studentData, error: studentError } = await supabaseClient
            .from('student2')
            .insert([
                { 
                    s_id: studentId,
                    s_name: fullName,
                    email: email,
                    address: address
                }
            ]);
        
        if (studentError) {
            throw studentError;
        }
        
        // Store student ID in localStorage for future use
        localStorage.setItem('studentId', studentId);
        localStorage.setItem('studentName', fullName);
        
        alert('Registration successful! Please proceed to select your courses.');
        window.location.href = 'courses.html';
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Login with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        // Get student info from student2 table
        const { data: studentData, error: studentError } = await supabaseClient
            .from('student2')
            .select('*')
            .eq('email', email)
            .single();
            
        if (studentError) {
            throw studentError;
        }
        
        // Store student ID in localStorage for future use
        localStorage.setItem('studentId', studentData.s_id);
        localStorage.setItem('studentName', studentData.s_name);
        
        // Redirect to index page after successful login
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error during login: ' + error.message);
    }
}

async function checkAuthState() {
    const studentId = localStorage.getItem('studentId');
    const staffRole = localStorage.getItem('staffRole');
    
    if (studentId) {
        // Student is logged in
        document.querySelectorAll('.for-logged-out').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.for-logged-in').forEach(el => {
            if (!el.classList.contains('staff-only')) {
                el.style.display = 'block';
            }
        });
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'block');

        // Update student name displays
        const studentName = localStorage.getItem('studentName');
        document.querySelectorAll('.student-name').forEach(el => {
            el.textContent = studentName || 'Student';
        });
    } else if (staffRole) {
        // Staff is logged in
        document.querySelectorAll('.for-logged-out').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.for-logged-in').forEach(el => {
            if (!el.classList.contains('student-only')) {
                el.style.display = 'block';
            }
        });
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'block');
        
        // Show only relevant dashboard link based on role
        if (staffRole === 'lecturer') {
            document.querySelectorAll('a[href="officer_dashboard.html"]').forEach(el => el.style.display = 'none');
        } else if (staffRole === 'officer') {
            document.querySelectorAll('a[href="lecturer_dashboard.html"]').forEach(el => el.style.display = 'none');
        }
        
        // Update staff name displays
        const staffName = localStorage.getItem('staffName');
        document.querySelectorAll('.staff-name').forEach(el => {
            el.textContent = staffName || 'Staff';
        });
    } else {
        // No one is logged in
        document.querySelectorAll('.for-logged-out').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.for-logged-in').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.staff-only').forEach(el => el.style.display = 'none');
    }
}

// Course Functions
async function loadHomepageCourses() {
    const coursesList = document.getElementById('home-courses-list');
    coursesList.innerHTML = '<div class="course-card placeholder"><h3>Loading courses...</h3></div>';
    
    try {
        // Get courses from Supabase
        const { data, error } = await supabaseClient
            .from('course')
            .select('*')
            .limit(6); // Limit to 6 courses for homepage
        
        if (error) {
            throw error;
        }
        
        if (data.length === 0) {
            coursesList.innerHTML = '<div class="course-card placeholder"><h3>No courses available</h3></div>';
            return;
        }
        
        // Display courses
        coursesList.innerHTML = '';
        data.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="course-image-placeholder"></div>
                <div class="course-content">
                    <h3>${course.c_name}</h3>
                    <p class="course-info">Course Code: ${course.c_code}</p>
                    ${course.location ? `<p class="course-location">Location: ${course.location}</p>` : ''}
                    <p class="course-description">${course.c_details || 'No details available'}</p>
                    <a href="courses.html" class="btn primary">View Details</a>
                </div>
            `;
            coursesList.appendChild(courseCard);
        });
    } catch (error) {
        coursesList.innerHTML = `<div class="course-card placeholder"><h3>Error loading courses: ${error.message}</h3></div>`;
    }
}

// Store all courses globally for search filtering
let allCourses = [];

async function loadCourses() {
    const coursesList = document.getElementById('courses-list');
    coursesList.innerHTML = '<div class="course-card placeholder"><h3>Loading courses...</h3></div>';
    
    try {
        // Get courses from Supabase
        const { data, error } = await supabaseClient
            .from('course')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        if (data.length === 0) {
            coursesList.innerHTML = '<div class="course-card placeholder"><h3>No courses available</h3></div>';
            return;
        }
        
        // Store all courses for search filtering
        allCourses = data;
        
        // Display courses
        displayCourses(data);
    } catch (error) {
        coursesList.innerHTML = `<div class="course-card placeholder"><h3>Error loading courses: ${error.message}</h3></div>`;
    }
}

function displayCourses(courses) {
    const coursesList = document.getElementById('courses-list');
    coursesList.innerHTML = '';
    
    if (courses.length === 0) {
        coursesList.innerHTML = '<div class="course-card placeholder"><h3>No courses match your search</h3></div>';
        return;
    }
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-image-placeholder"></div>
            <div class="course-content">
                <h3>${course.c_name}</h3>
                <p class="course-info">Course Code: ${course.c_code}</p>
                ${course.location ? `<p class="course-location">Location: ${course.location}</p>` : ''}
                <p class="course-description">${course.c_details || 'No details available'}</p>
                <button class="btn primary enroll-btn" data-course-code="${course.c_code}">Enroll Now</button>
            </div>
        `;
        coursesList.appendChild(courseCard);
    });
    
    // Add event listeners to enroll buttons
    document.querySelectorAll('.enroll-btn').forEach(button => {
        button.addEventListener('click', handleEnrollment);
    });
}

function handleCourseSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        // If search is empty, show all courses
        displayCourses(allCourses);
        return;
    }
    
    // Filter courses based on search term
    const filteredCourses = allCourses.filter(course => 
        course.c_name.toLowerCase().includes(searchTerm) || 
        course.c_code.toLowerCase().includes(searchTerm) ||
        (course.c_details && course.c_details.toLowerCase().includes(searchTerm)) ||
        (course.location && course.location.toLowerCase().includes(searchTerm))
    );
    
    displayCourses(filteredCourses);
}

// Handle course enrollment from courses page
async function handleEnrollment(e) {
    const courseCode = e.target.getAttribute('data-course-code');
    const studentId = localStorage.getItem('studentId');
    
    if (!studentId) {
        alert('Please log in or register to enroll in courses');
        window.location.href = 'register.html';
        return;
    }
    
    try {
        // Add enrollment to student_course table
        const { data, error } = await supabaseClient
            .from('student_course')
            .insert([
                { 
                    s_id: studentId,
                    c_code: courseCode
                }
            ]);
        
        if (error) {
            if (error.code === '23505') {
                alert('You have already registered for this course');
            } else {
                throw error;
            }
        } else {
            alert('Course registration submitted successfully!');
        }
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}

// Load courses for enrollment form
async function loadCoursesForEnrollment() {
    const courseSelect = document.getElementById('course-select');
    if (!courseSelect) return;
    
    try {
        // Get courses from Supabase
        const { data, error } = await supabaseClient
            .from('course')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        if (data.length === 0) {
            courseSelect.innerHTML = '<option value="">No courses available</option>';
            return;
        }
        
        // Populate the select dropdown
        courseSelect.innerHTML = '<option value="">Select a course</option>';
        data.forEach(course => {
            const option = document.createElement('option');
            option.value = course.c_code;
            option.textContent = `${course.c_name} (${course.c_code})`;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        courseSelect.innerHTML = '<option value="">Error loading courses</option>';
        console.error('Error loading courses:', error);
    }
}

// Handle course enrollment from the enrollment form
async function handleCourseEnrollment(e) {
    e.preventDefault();
    
    const courseCode = document.getElementById('course-select').value;
    const studentId = localStorage.getItem('studentId');
    
    if (!courseCode) {
        alert('Please select a course');
        return;
    }
    
    if (!studentId) {
        alert('Please log in or register first');
        window.location.href = 'register.html';
        return;
    }
    
    try {
        // Add enrollment to student_course table
        const { data, error } = await supabaseClient
            .from('student_course')
            .insert([
                { 
                    s_id: studentId,
                    c_code: courseCode
                }
            ]);
        
        if (error) {
            if (error.code === '23505') {
                alert('You have already registered for this course');
            } else {
                throw error;
            }
        } else {
            alert('Course registration submitted successfully!');
            document.getElementById('enrollment-form').reset();
        }
    } catch (error) {
        alert('Error during registration: ' + error.message);
    }
}

function handleLogout(e) {
    e.preventDefault();
    
    // Check if it's a staff logout
    const isStaff = localStorage.getItem('staffRole');
    
    // Clear localStorage
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffRole');
    
    // Redirect to appropriate page
    if (isStaff) {
        window.location.href = 'admin_login.html';
    } else {
        window.location.href = 'index.html';
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const staffId = document.getElementById('staffId').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    try {
        // For demo purposes, we'll use a simple validation
        // In a real application, this would validate against the database
        
        // Check if it's a lecturer or officer login
        if (role === 'lecturer') {
            // Demo lecturer credentials (in a real app, this would be a database check)
            if (staffId === 'admin' && password === 'admin') {
                localStorage.setItem('staffId', staffId);
                localStorage.setItem('staffName', 'Demo Lecturer');
                localStorage.setItem('staffRole', 'lecturer');
                
                window.location.href = 'lecturer_dashboard.html';
            } else {
                throw new Error('Invalid lecturer credentials');
            }
        } else if (role === 'officer') {
            // Demo officer credentials
            if (staffId === 'admin' && password === 'admin') {
                localStorage.setItem('staffId', staffId);
                localStorage.setItem('staffName', 'Demo Officer');
                localStorage.setItem('staffRole', 'officer');
                
                window.location.href = 'officer_dashboard.html';
            } else {
                throw new Error('Invalid officer credentials');
            }
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Modal Functions
function initModals() {
    // Close modal when clicking the X or the Cancel button
    document.querySelectorAll('.close-modal, .close-btn').forEach(element => {
        element.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Approve button in review modal
    const approveBtn = document.getElementById('approve-btn');
    if (approveBtn) {
        approveBtn.addEventListener('click', handleApplicationApproval);
    }
    
    // Reject button in review modal
    const rejectBtn = document.getElementById('reject-btn');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', handleApplicationRejection);
    }
    
    // Verify button in verification modal
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleApplicationVerification);
    }
}

// Lecturer Dashboard Functions
function initLecturerDashboard() {
    // Load all applications for the lecturer to review
    loadLecturerApplications();
    
    // Display staff name
    document.querySelectorAll('.staff-name').forEach(element => {
        element.textContent = localStorage.getItem('staffName') || 'Lecturer';
    });
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadLecturerApplications);
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadLecturerApplications);
    }
    
    // Set up course filter
    const courseFilter = document.getElementById('course-filter');
    if (courseFilter) {
        loadCoursesForFilter(courseFilter);
        courseFilter.addEventListener('change', loadLecturerApplications);
    }
}

async function loadLecturerApplications() {
    const statusFilter = document.getElementById('status-filter').value;
    const courseFilter = document.getElementById('course-filter').value;
    const applicationsList = document.getElementById('applications-list');
    
    applicationsList.innerHTML = '<tr class="placeholder-row"><td colspan="6">Loading applications...</td></tr>';
    
    try {
        // In a real application, this would query applications from the database
        // For demo purposes, we'll create some sample data
        
        // First, get student_course entries
        const { data: enrollments, error: enrollmentsError } = await supabaseClient
            .from('student_course')
            .select(`
                s_id,
                c_code
            `);
            
        if (enrollmentsError) throw enrollmentsError;
        
        // Get student details for each enrollment
        const studentIds = [...new Set(enrollments.map(e => e.s_id))];
        const { data: students, error: studentsError } = await supabaseClient
            .from('student2')
            .select('*')
            .in('s_id', studentIds);
            
        if (studentsError) throw studentsError;
        
        // Get course details for each enrollment
        const courseCodes = [...new Set(enrollments.map(e => e.c_code))];
        const { data: courses, error: coursesError } = await supabaseClient
            .from('course')
            .select('*')
            .in('c_code', courseCodes);
            
        if (coursesError) throw coursesError;
        
        // Combine the data and add a fake status for demo
        const applications = enrollments.map(enrollment => {
            const student = students.find(s => s.s_id === enrollment.s_id);
            const course = courses.find(c => c.c_code === enrollment.c_code);
            
            // Generate a random status for demo
            const statuses = ['pending', 'approved', 'rejected'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            return {
                id: `${enrollment.s_id}-${enrollment.c_code}`,
                student_id: enrollment.s_id,
                student_name: student?.s_name || 'Unknown',
                student_email: student?.email || 'unknown@example.com',
                student_address: student?.address || 'No address provided',
                course_code: enrollment.c_code,
                course_name: course?.c_name || 'Unknown Course',
                status: randomStatus
            };
        });
        
        // Apply filters
        let filteredApplications = applications;
        
        if (statusFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
        }
        
        if (courseFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.course_code === courseFilter);
        }
        
        // Display applications
        if (filteredApplications.length === 0) {
            applicationsList.innerHTML = '<tr class="placeholder-row"><td colspan="6">No applications found</td></tr>';
            return;
        }
        
        applicationsList.innerHTML = '';
        filteredApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.student_id}</td>
                <td>${app.student_name}</td>
                <td>${app.student_email}</td>
                <td>${app.course_name} (${app.course_code})</td>
                <td><span class="status-badge ${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm primary review-btn" data-id="${app.id}">Review</button>
                    </div>
                </td>
            `;
            applicationsList.appendChild(row);
        });
        
        // Add event listeners to review buttons
        document.querySelectorAll('.review-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const appId = e.target.getAttribute('data-id');
                const app = filteredApplications.find(a => a.id === appId);
                openReviewModal(app);
            });
        });
        
    } catch (error) {
        applicationsList.innerHTML = `<tr class="placeholder-row"><td colspan="6">Error loading applications: ${error.message}</td></tr>`;
    }
}

function openReviewModal(application) {
    // Set modal content
    document.getElementById('modal-student-id').textContent = application.student_id;
    document.getElementById('modal-student-name').textContent = application.student_name;
    document.getElementById('modal-student-email').textContent = application.student_email;
    document.getElementById('modal-student-address').textContent = application.student_address;
    document.getElementById('modal-course-name').textContent = `${application.course_name} (${application.course_code})`;
    
    // Store the application ID for approval/rejection
    document.getElementById('review-modal').setAttribute('data-app-id', application.id);
    
    // Clear previous notes
    document.getElementById('review-notes').value = '';
    
    // Display the modal
    document.getElementById('review-modal').style.display = 'block';
}

function handleApplicationApproval() {
    const appId = document.getElementById('review-modal').getAttribute('data-app-id');
    const notes = document.getElementById('review-notes').value;
    
    // In a real app, this would update the database
    alert(`Application ${appId} approved with notes: ${notes}`);
    
    // Close the modal and refresh applications
    document.getElementById('review-modal').style.display = 'none';
    loadLecturerApplications();
}

function handleApplicationRejection() {
    const appId = document.getElementById('review-modal').getAttribute('data-app-id');
    const notes = document.getElementById('review-notes').value;
    
    // In a real app, this would update the database
    alert(`Application ${appId} rejected with notes: ${notes}`);
    
    // Close the modal and refresh applications
    document.getElementById('review-modal').style.display = 'none';
    loadLecturerApplications();
}

// Officer Dashboard Functions
function initOfficerDashboard() {
    // Load all applications for the officer to verify
    loadOfficerApplications();
    
    // Display staff name
    document.querySelectorAll('.staff-name').forEach(element => {
        element.textContent = localStorage.getItem('staffName') || 'Officer';
    });
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadOfficerApplications);
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadOfficerApplications);
    }
    
    // Set up course filter
    const courseFilter = document.getElementById('course-filter');
    if (courseFilter) {
        loadCoursesForFilter(courseFilter);
        courseFilter.addEventListener('change', loadOfficerApplications);
    }
}

async function loadOfficerApplications() {
    const statusFilter = document.getElementById('status-filter').value;
    const courseFilter = document.getElementById('course-filter').value;
    const applicationsList = document.getElementById('applications-list');
    
    applicationsList.innerHTML = '<tr class="placeholder-row"><td colspan="7">Loading applications...</td></tr>';
    
    try {
        // For demo purposes, this function is similar to loadLecturerApplications
        // But with additional fields for lecturer approval
        
        // First, get student_course entries
        const { data: enrollments, error: enrollmentsError } = await supabaseClient
            .from('student_course')
            .select(`
                s_id,
                c_code
            `);
            
        if (enrollmentsError) throw enrollmentsError;
        
        // Get student details for each enrollment
        const studentIds = [...new Set(enrollments.map(e => e.s_id))];
        const { data: students, error: studentsError } = await supabaseClient
            .from('student2')
            .select('*')
            .in('s_id', studentIds);
            
        if (studentsError) throw studentsError;
        
        // Get course details for each enrollment
        const courseCodes = [...new Set(enrollments.map(e => e.c_code))];
        const { data: courses, error: coursesError } = await supabaseClient
            .from('course')
            .select('*')
            .in('c_code', courseCodes);
            
        if (coursesError) throw coursesError;
        
        // Combine the data and add a fake status for demo
        const applications = enrollments.map(enrollment => {
            const student = students.find(s => s.s_id === enrollment.s_id);
            const course = courses.find(c => c.c_code === enrollment.c_code);
            
            // Generate a random status for demo (mostly lecturer_approved for officer view)
            const statuses = ['lecturer_approved', 'verified', 'rejected'];
            const weights = [0.7, 0.2, 0.1]; // 70% chance for lecturer_approved
            const randomStatus = weightedRandom(statuses, weights);
            
            // Random lecturer name
            const lecturers = ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams'];
            const randomLecturer = lecturers[Math.floor(Math.random() * lecturers.length)];
            
            return {
                id: `${enrollment.s_id}-${enrollment.c_code}`,
                student_id: enrollment.s_id,
                student_name: student?.s_name || 'Unknown',
                student_email: student?.email || 'unknown@example.com',
                student_address: student?.address || 'No address provided',
                course_code: enrollment.c_code,
                course_name: course?.c_name || 'Unknown Course',
                lecturer: randomLecturer,
                lecturer_notes: 'Student has required qualifications.',
                status: randomStatus
            };
        });
        
        // Apply filters
        let filteredApplications = applications;
        
        if (statusFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
        }
        
        if (courseFilter !== 'all') {
            filteredApplications = filteredApplications.filter(app => app.course_code === courseFilter);
        }
        
        // Display applications
        if (filteredApplications.length === 0) {
            applicationsList.innerHTML = '<tr class="placeholder-row"><td colspan="7">No applications found</td></tr>';
            return;
        }
        
        applicationsList.innerHTML = '';
        filteredApplications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.student_id}</td>
                <td>${app.student_name}</td>
                <td>${app.student_email}</td>
                <td>${app.course_name} (${app.course_code})</td>
                <td>${app.lecturer}</td>
                <td><span class="status-badge ${app.status === 'lecturer_approved' ? 'approved' : app.status}">${formatStatus(app.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        ${app.status === 'lecturer_approved' ? `<button class="btn btn-sm primary verify-btn" data-id="${app.id}">Verify</button>` : ''}
                    </div>
                </td>
            `;
            applicationsList.appendChild(row);
        });
        
        // Add event listeners to verify buttons
        document.querySelectorAll('.verify-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const appId = e.target.getAttribute('data-id');
                const app = filteredApplications.find(a => a.id === appId);
                openVerificationModal(app);
            });
        });
        
    } catch (error) {
        applicationsList.innerHTML = `<tr class="placeholder-row"><td colspan="7">Error loading applications: ${error.message}</td></tr>`;
    }
}

function openVerificationModal(application) {
    // Set modal content
    document.getElementById('modal-student-id').textContent = application.student_id;
    document.getElementById('modal-student-name').textContent = application.student_name;
    document.getElementById('modal-student-email').textContent = application.student_email;
    document.getElementById('modal-student-address').textContent = application.student_address;
    document.getElementById('modal-course-name').textContent = `${application.course_name} (${application.course_code})`;
    document.getElementById('modal-lecturer-notes').textContent = application.lecturer_notes;
    
    // Store the application ID for verification
    document.getElementById('verification-modal').setAttribute('data-app-id', application.id);
    
    // Clear previous notes
    document.getElementById('verification-notes').value = '';
    
    // Display the modal
    document.getElementById('verification-modal').style.display = 'block';
}

function handleApplicationVerification() {
    const appId = document.getElementById('verification-modal').getAttribute('data-app-id');
    const notes = document.getElementById('verification-notes').value;
    const generateCredentials = document.getElementById('generate-credentials').checked;
    
    // In a real app, this would update the database and send credentials if checked
    if (generateCredentials) {
        const username = `student${appId.split('-')[0]}`;
        const password = generateRandomPassword();
        alert(`Application ${appId} verified with notes: ${notes}\n\nStudent credentials generated:\nUsername: ${username}\nPassword: ${password}`);
    } else {
        alert(`Application ${appId} verified with notes: ${notes}`);
    }
    
    // Close the modal and refresh applications
    document.getElementById('verification-modal').style.display = 'none';
    loadOfficerApplications();
}

// Helper Functions
async function loadCoursesForFilter(selectElement) {
    try {
        // Get courses from Supabase
        const { data, error } = await supabaseClient
            .from('course')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        // Add course options to the select element
        data.forEach(course => {
            const option = document.createElement('option');
            option.value = course.c_code;
            option.textContent = `${course.c_name} (${course.c_code})`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading courses for filter:', error);
    }
}

function formatStatus(status) {
    switch (status) {
        case 'lecturer_approved':
            return 'Lecturer Approved';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function weightedRandom(items, weights) {
    const cumulativeWeights = [];
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        cumulativeWeights.push(sum);
    }
    
    const random = Math.random() * sum;
    
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) {
            return items[i];
        }
    }
    
    return items[items.length - 1];
} 