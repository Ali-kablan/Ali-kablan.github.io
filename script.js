document.addEventListener('DOMContentLoaded', () => {
    const langEnButton = document.getElementById('lang-en');
    const langArButton = document.getElementById('lang-ar');
    const translatableElements = document.querySelectorAll('[data-translate]');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('menu-active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('menu-active');
            document.body.classList.remove('menu-open');
        });
    });

    // Hall Gallery Showcase
    const setupHallGallery = () => {
        const showcaseMain = document.querySelector('.hall-showcase-main');
        const showcaseThumbs = document.querySelectorAll('.hall-showcase-thumbs img');
        const showcaseMainImages = document.querySelectorAll('.hall-showcase-main img');
        
        // If the gallery doesn't exist on this page, return
        if (!showcaseMain) return;
        
        // Preload all images to prevent lag
        const preloadImages = () => {
            showcaseMainImages.forEach(img => {
                const src = img.getAttribute('src');
                if (src) {
                    const newImage = new Image();
                    newImage.src = src;
                }
            });
        };
        
        // Preload images on page load
        preloadImages();
        
        // Display main image based on thumbnail selection
        showcaseThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Update active thumbnail
                showcaseThumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                // Get index of selected thumbnail
                const index = parseInt(thumb.getAttribute('data-index'));
                
                // Update main image
                showcaseMainImages.forEach((img, i) => {
                    if (i === index) {
                        img.classList.add('active');
                    } else {
                        img.classList.remove('active');
                    }
                });
            });
        });
    };
    
    // Hall Gallery Slider - New improved version
    const setupHallSlider = () => {
        const sliderContainer = document.getElementById('mainEventSlider');
        if (!sliderContainer) return;
        
        const sliderTrack = sliderContainer.querySelector('.slider-track');
        const sliderDots = sliderContainer.querySelectorAll('.slider-dots .dot');
        const prevButton = sliderContainer.querySelector('.slider-prev');
        const nextButton = sliderContainer.querySelector('.slider-next');
        const slides = sliderContainer.querySelectorAll('.slide');
        
        let currentSlide = 0;
        const slideCount = slides.length;
        
        // Manually preload all images before initializing slider
        const preloadSliderImages = () => {
            return new Promise((resolve) => {
                let loadedImages = 0;
                const totalImages = slides.length;
                
                slides.forEach((slide) => {
                    const img = slide.querySelector('img');
                    if (!img) {
                        loadedImages++;
                        if (loadedImages === totalImages) resolve();
                        return;
                    }
                    
                    // If image is already loaded from cache
                    if (img.complete) {
                        loadedImages++;
                        if (loadedImages === totalImages) resolve();
                        return;
                    }
                    
                    // For images still loading
                    img.addEventListener('load', () => {
                        loadedImages++;
                        if (loadedImages === totalImages) resolve();
                    });
                    
                    // In case of error, still continue
                    img.addEventListener('error', () => {
                        console.warn('Error loading image:', img.src);
                        loadedImages++;
                        if (loadedImages === totalImages) resolve();
                    });
                    
                    // Force reload of image to ensure load event fires
                    if (img.src) {
                        const currentSrc = img.src;
                        img.src = '';
                        img.src = currentSrc;
                    }
                });
                
                // If no images or already all loaded
                if (totalImages === 0 || loadedImages === totalImages) {
                    resolve();
                }
            });
        };
        
        // Update slider position with improved transform
        const updateSlider = () => {
            // Move slide track to show current slide
            const offset = -(currentSlide * (100 / slideCount));
            sliderTrack.style.transform = `translateX(${offset}%)`;
            
            // Update active dot
            sliderDots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };
        
        // Initialize slider after images are loaded
        const initSlider = async () => {
            try {
                // Wait for images to preload
                await preloadSliderImages();
                
                // Enable buttons after images are loaded
                prevButton.disabled = false;
                nextButton.disabled = false;
                
                // Initial update
                updateSlider();
                
                // Event listeners for next/prev buttons
                nextButton.addEventListener('click', () => {
                    currentSlide = (currentSlide + 1) % slideCount;
                    updateSlider();
                    resetTimer();
                });
                
                prevButton.addEventListener('click', () => {
                    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
                    updateSlider();
                    resetTimer();
                });
                
                // Event listeners for dots
                sliderDots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        currentSlide = index;
                        updateSlider();
                        resetTimer();
                    });
                });
                
                // Swipe support for touch devices
                let touchStartX = 0;
                let touchEndX = 0;
                
                sliderContainer.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, {passive: true});
                
                sliderContainer.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }, {passive: true});
                
                const handleSwipe = () => {
                    const swipeThreshold = 50;
                    if (touchStartX - touchEndX > swipeThreshold) {
                        // Swipe left - next slide
                        currentSlide = (currentSlide + 1) % slideCount;
                        updateSlider();
                        resetTimer();
                    } else if (touchEndX - touchStartX > swipeThreshold) {
                        // Swipe right - previous slide
                        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
                        updateSlider();
                        resetTimer();
                    }
                };
                
                // Auto-advance slider with reset capability
                let sliderTimer = startAutoSlide();
                
                function startAutoSlide() {
                    return setInterval(() => {
                        if (document.hidden) return; // Don't advance if page is not visible
                        currentSlide = (currentSlide + 1) % slideCount;
                        updateSlider();
                    }, 5000);
                }
                
                function resetTimer() {
                    clearInterval(sliderTimer);
                    sliderTimer = startAutoSlide();
                }
                
                // Stop auto-advance on hover
                sliderContainer.addEventListener('mouseenter', () => {
                    clearInterval(sliderTimer);
                });
                
                sliderContainer.addEventListener('mouseleave', () => {
                    sliderTimer = startAutoSlide();
                });
                
            } catch (error) {
                console.error('Error initializing slider:', error);
            }
        };
        
        // Start slider initialization
        initSlider();
    };

    const translations = {
        en: {
            pageTitle: "Al Masa Hotel 2",
            hotelName: "Al Masa Hotel 2",
            hotelNameAltText: "Al Masa Hotel 2 Logo",
            navHome: "Home",
            navServices: "Services",
            navRooms: "Rooms",
            navMeals: "Meals",
            navInterior: "Interior",
            navCafe: "Cafe",
            navContact: "Contact",
            welcomeMessage: "Welcome to Al Masa Hotel 2",
            welcomeSubtext: "Experience luxury and comfort.",
            ctaBookNow: "Book Now",
            servicesTitle: "Our Services",
            serviceWifiTitle: "Free WiFi",
            serviceWifiDesc: "High-speed internet access throughout the hotel.",
            serviceParkingTitle: "Parking",
            serviceParkingDesc: "Secure parking available for guests.",
            serviceRestaurantTitle: "Restaurant",
            serviceRestaurantDesc: "Delicious meals served daily in our restaurant.",
            hallTitle: "Event Hall",
            hallSubtitle: "Elegant Celebrations",
            hallDesc: "Our elegant event hall is perfect for weddings, conferences, and special celebrations. With modern amenities and stunning décor, we provide the perfect setting for your memorable moments.",
            hallFeatureGuests: "Guests Capacity",
            hallFeatureEvents: "Events Per Year",
            hallMainAltText: "Main Hall View",
            hallThumb1AltText: "Event Hall",
            hallThumb2AltText: "Hall Setup",
            hallThumb3AltText: "Wedding Setup",
            hallThumb4AltText: "Celebration Setup",
            hallThumb5AltText: "Conference Setup",
            hallSlide1AltText: "Event Hall",
            hallSlide2AltText: "Hall Setup",
            hallSlide3AltText: "Wedding Setup",
            hallSlide4AltText: "Celebration Setup",
            hallSlide5AltText: "Conference Setup",
            roomsTitle: "Rooms & Pricing",
            roomDeluxeTitle: "Deluxe Suite",
            roomDeluxeDesc: "Spacious suite with separate living area, modern amenities, and stunning views.",
            roomDeluxePrice: "Starts from 250 D",
            roomStandardTitle: "Standard Room",
            roomStandardDesc: "Comfortable room with all essential amenities for a pleasant stay.",
            roomStandardPrice: "Starts from 250 D",
            roomPremiumTitle: "Premium Room",
            roomPremiumDesc: "Elegant room with premium furnishings and enhanced amenities.",
            roomPremiumPrice: "Starts from 250 D",
            mealsTitle: "Dining & Meals",
            mealSelectionTitle: "Gourmet Selection",
            mealSelectionDesc: "Enjoy our extensive selection of freshly prepared meals and desserts.",
            mealBreakfastTitle: "Breakfast Buffet",
            mealBreakfastDesc: "Start your day with our wide selection of breakfast options.",
            mealDinnerTitle: "Elegant Dining",
            mealDinnerDesc: "Enjoy exquisite local and international cuisine for lunch and dinner.",
            interiorTitle: "Hotel Interior",
            interiorLobbyAltText: "Hotel Lobby",
            interiorCourtyardAltText: "Hotel Courtyard",
            interiorCommonAreaAltText: "Hotel Common Area",
            cafeTitle: "Hotel Cafe",
            cafeSubtitle: "Refreshments & Snacks",
            cafeDesc: "Visit our cafe for freshly brewed coffee, tea, and a variety of snacks and refreshments. Perfect for casual meetings or a relaxing break during your stay.",
            cafeImageAltText: "Hotel Cafe",
            contactTitle: "Contact Information",
            contactIntro: "We're happy to hear from you. Visit us at Al Masa Hotel 2 or contact us via phone or email.",
            contactDetailsHeading: "Our contact details:",
            phoneLabel: "Phone:",
            instagramLabel: "Instagram:",
            addressLabel: "Address:",
            addressText: "Misrata - Benghazi Street",
            mapPlaceholder: "Map will be loaded here.",
            copyright: "&copy; 2024 Al Masa Hotel 2. All rights reserved."
        },
        ar: {
            pageTitle: "فندق الماسة 2",
            hotelName: "فندق الماسة 2",
            hotelNameAltText: "شعار فندق الماسة 2",
            navHome: "الرئيسية",
            navServices: "الخدمات",
            navRooms: "الغرف",
            navMeals: "الوجبات",
            navInterior: "داخلية الفندق",
            navCafe: "المقهى",
            navContact: "اتصل بنا",
            welcomeMessage: "مرحباً بكم في فندق الماسة 2",
            welcomeSubtext: "تجربة من الفخامة والراحة.",
            ctaBookNow: "احجز الآن",
            servicesTitle: "خدماتنا",
            serviceWifiTitle: "واي فاي مجاني",
            serviceWifiDesc: "خدمة إنترنت عالية السرعة في جميع أنحاء الفندق.",
            serviceParkingTitle: "موقف سيارات",
            serviceParkingDesc: "موقف سيارات آمن متاح للضيوف.",
            serviceRestaurantTitle: "مطعم",
            serviceRestaurantDesc: "وجبات لذيذة تقدم يومياً في مطعمنا.",
            hallTitle: "صالة المناسبات",
            hallSubtitle: "احتفالات أنيقة",
            hallDesc: "صالة المناسبات الأنيقة مثالية للأعراس والمؤتمرات والاحتفالات الخاصة. مع وسائل الراحة الحديثة والديكور المذهل، نوفر المكان المثالي للحظاتكم التي لا تنسى.",
            hallFeatureGuests: "سعة الضيوف",
            hallFeatureEvents: "فعالية سنوياً",
            hallMainAltText: "منظر القاعة الرئيسية",
            hallThumb1AltText: "صورة مصغرة لقاعة المناسبات 1",
            hallThumb2AltText: "صورة مصغرة لقاعة المناسبات 2",
            hallThumb3AltText: "صورة مصغرة لقاعة المناسبات 3",
            hallThumb4AltText: "صورة مصغرة لقاعة المناسبات 4",
            hallThumb5AltText: "صورة مصغرة لقاعة المناسبات 5",
            hallSlide1AltText: "شريحة قاعة المناسبات 1",
            hallSlide2AltText: "شريحة قاعة المناسبات 2",
            hallSlide3AltText: "شريحة قاعة المناسبات 3",
            hallSlide4AltText: "شريحة قاعة المناسبات 4",
            hallSlide5AltText: "شريحة قاعة المناسبات 5",
            roomsTitle: "الغرف والأسعار",
            roomDeluxeTitle: "جناح ديلوكس",
            roomDeluxeDesc: "جناح واسع مع منطقة معيشة منفصلة ووسائل راحة حديثة وإطلالات خلابة.",
            roomDeluxePrice: "تبدأ من 250 د",
            roomStandardTitle: "غرفة قياسية",
            roomStandardDesc: "غرفة مريحة مع جميع وسائل الراحة الأساسية لإقامة ممتعة.",
            roomStandardPrice: "تبدأ من 250 د",
            roomPremiumTitle: "غرفة بريميوم",
            roomPremiumDesc: "غرفة أنيقة مع مفروشات فاخرة ووسائل راحة معززة.",
            roomPremiumPrice: "تبدأ من 250 د",
            mealsTitle: "الطعام والوجبات",
            mealSelectionTitle: "تشكيلة فاخرة",
            mealSelectionDesc: "استمتع بتشكيلتنا الواسعة من الوجبات والحلويات المُعدة طازجة.",
            mealBreakfastTitle: "بوفيه الإفطار",
            mealBreakfastDesc: "ابدأ يومك مع مجموعة واسعة من خيارات الإفطار.",
            mealDinnerTitle: "تناول الطعام الأنيق",
            mealDinnerDesc: "استمتع بالمأكولات المحلية والعالمية الرائعة للغداء والعشاء.",
            interiorTitle: "داخلية الفندق",
            interiorLobbyAltText: "ردهة الفندق",
            interiorCourtyardAltText: "فناء الفندق",
            interiorCommonAreaAltText: "المنطقة المشتركة للفندق",
            cafeTitle: "مقهى الفندق",
            cafeSubtitle: "المرطبات والوجبات الخفيفة",
            cafeDesc: "قم بزيارة مقهانا للحصول على القهوة الطازجة والشاي ومجموعة متنوعة من الوجبات الخفيفة والمرطبات. مثالي للاجتماعات غير الرسمية أو استراحة مريحة خلال إقامتك.",
            cafeImageAltText: "مقهى الفندق",
            contactTitle: "معلومات الاتصال",
            contactIntro: "نحن نسعد بالتواصل معكم. يمكنكم زيارتنا في فندق الماسة 2 أو التواصل معنا عبر الهاتف أو البريد الإلكتروني.",
            contactDetailsHeading: "تفاصيل الاتصال:",
            phoneLabel: "الهاتف:",
            instagramLabel: "انستجرام:",
            addressLabel: "العنوان:",
            addressText: "مصراتة - شارع بنغازي",
            mapPlaceholder: "سيتم تحميل الخريطة هنا.",
            copyright: "&copy; 2024 فندق الماسة 2. جميع الحقوق محفوظة."
        }
    };

    function setLanguage(lang) {
        // Update text content
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                // Use innerHTML for keys like 'copyright' that might contain HTML entities
                if (key === 'copyright') {
                    element.innerHTML = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Update HTML lang and dir attributes
        document.documentElement.lang = lang;
        document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update active button style
        if (lang === 'ar') {
            langArButton.classList.add('active');
            langEnButton.classList.remove('active');
        } else {
            langEnButton.classList.add('active');
            langArButton.classList.remove('active');
        }

        // Optional: Store language preference
        localStorage.setItem('preferredLanguage', lang);
    }

    // Event listeners for language buttons
    langEnButton.addEventListener('click', () => setLanguage('en'));
    langArButton.addEventListener('click', () => setLanguage('ar'));

    // Optional: Check for stored language preference on load
    const preferredLang = localStorage.getItem('preferredLanguage');
    if (preferredLang) {
        setLanguage(preferredLang);
    } else {
        // Default to English if no preference is stored
        setLanguage('en');
    }

    // --- Smooth Scrolling --- 
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // --- Scroll Animation ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }

    // Initial check
    checkScroll();

    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Initialize hall gallery and slider
    setupHallGallery();
    setupHallSlider();

    // Hero Background Slideshow
    const setupHeroSlideshow = () => {
        const heroSection = document.getElementById('home'); // Still needed for context if any, but not for direct bg change
        const slides = document.querySelectorAll('.hero-bg-slide');
        if (!heroSection || slides.length === 0) return;

        let currentImageIndex = 0;

        // No need to preload here as images are set via inline style in HTML, browser handles loading.
        // If images were set via JS, preloading would be more critical here.

        // Make the first slide visible initially
        if (slides.length > 0) {
            slides[currentImageIndex].classList.add('active');
            // Opacity is handled by the .active class in CSS
        }

        const crossfadeNextImage = () => {
            if (slides.length === 0) return;

            // Fade out current slide
            slides[currentImageIndex].classList.remove('active');
            // Opacity will transition to 0 due to CSS

            // Move to next slide index
            currentImageIndex = (currentImageIndex + 1) % slides.length;

            // Fade in next slide
            slides[currentImageIndex].classList.add('active');
            // Opacity will transition to 1 due to CSS
        };
        
        setInterval(crossfadeNextImage, 7000); // Change image every 7 seconds
    };

    setupHeroSlideshow();
}); 