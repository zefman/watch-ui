( function() {

    var isDragging = false;
    var mousedown = false;

    // Used to throttle the mouse and pointer events
    var throttle   = false;
    setInterval( function() {
        throttle = false;
    }, 16.6 );

    var viewportHeight  = $( '.viewport' ).innerHeight();
    var viewportWidth   = $( '.viewport' ).innerWidth();
    var viewPortCenterY = $( '.viewport' ).offset().top + ( viewportHeight / 2 );
    var viewPortCenterX = $( '.viewport' ).offset().left + ( viewportWidth / 2 );

    var container           = $( '.container' );
    var containerHeight     = container.height();
    var containerWidth      = container.width();
    var maxContainerOffsetX = containerWidth / 2;
    var maxContainerOffsetY = containerHeight / 2;

    var containerX = 0;
    var containerY = 0;
    var moveX      = 0;
    var moveY      = 0;
    var lastX      = 0;
    var lastY      = 0;

    var iconContainers = $( '.bubble-container' );
    var icons          = $( '.bubble-container .bubble' );
    var totalIcons     = icons.length;
    var iconsPerRow    = $( '.row:first-child .bubble-container' ).length;
    var iconsPad       = 5;
    var iconHeight     = Math.floor( ( containerWidth / iconsPerRow ) - iconsPad );
    var iconWidth      = iconHeight;

    var allowUpdate = true;
    var selected    = false;
    var selectedIcon;
    var selectedH1;

    // Set the icons size
    iconContainers.css( { height: iconHeight + 'px', width: iconWidth + 'px' } );

    // Give every other row left padding to offset the icons
    $( '.row:odd' ).css( { 'padding-left': ( iconWidth / 2 ) + 'px' } );

    // Fade in the icons
    iconContainers.each( function() {
        var delay = Math.floor( Math.random() * ( 10 - 1 ) + 1 );
        $( this ).addClass( 'animate animate--fadeInScale animate-delay-' + delay );

        // When we are finished remove the class - if we don't do this
        // it seems to tank performance on ios safari for some reason
        $( this ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $( this ).removeClass( 'animate animate--fadeInScale animate-delay-' + delay );
        } );
    } );

    // Start rendering
    window.requestAnimationFrame( update );

    /**
     * The main update loop
     */
    function update() {
        if ( allowUpdate ) {
            // Make sure the movement speed is limited
            moveX = Math.max( Math.min( moveX, 40 ), -40 );
            moveY = Math.max( Math.min( moveY, 40 ), -40 );

            // Update the contain position
            containerX += moveX;
            containerY += moveY;

            // Translate the container
            container.css( {
                transform: 'translate3d( ' + ( containerX ) + 'px, ' + ( containerY ) + 'px, 0 )'
            } );
        }

        // If an icon was selected position it in the center
        // by translating the container with its offset to its center
        if ( selected && allowUpdate ) {

            var rect = selectedIcon.getBoundingClientRect();
            var iconCenterAdjust = rect.width / 2;
            var offsetX = viewPortCenterX - ( rect.left + iconCenterAdjust );
            var offsetY = viewPortCenterY - ( rect.top + iconCenterAdjust );

            // Position the container
            container.css( {
                transition: 'all 1s ease',
                transform: 'translate3d( ' + ( containerX + offsetX ) + 'px, ' + ( containerY + offsetY ) + 'px, 0 )'
            } );

            allowUpdate = false;

            $( container ).one( 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                // hide the scaled h1
                selectedH1.style.display = 'block';
                // show the unsclaed h1
                selectedIcon.firstChild.style.visibility = 'hidden';
                // add the class in order to grow
                $( selectedIcon ).addClass( 'animate bubble--selected' );

                $rootScope.animationClass = "transition-view";

                return;
            } );
        }

        // Add drag so the movement slows down
        moveX *= 0.95;
        moveY *= 0.95;

        // Check we aren't going out of bounds and if we are
        // start to move back
        if ( !isDragging ) {
            if ( containerX > maxContainerOffsetX ) {
                moveX = -10;
            }

            if ( containerX < -maxContainerOffsetX ) {
                moveX = 10;
            }

            if ( containerY > maxContainerOffsetY ) {
                moveY = -10;
            }

            if ( containerY < -maxContainerOffsetY ) {
                moveY = 10;
            }
        }

        // Adjust the scale of the dots
        setScale();

        window.requestAnimationFrame( update );
    }

    container.bind( 'touchstart mousedown', function( event ) {

        isDragging = false;
        mousedown = true;
        if ( event.type == 'touchstart' ) {
            lastX = event.originalEvent.touches[ 0 ].pageX;
            lastY = event.originalEvent.touches[ 0 ].pageY;
        } else {
            lastX = event.clientX;
            lastY = event.clientY;
        }

    } ).bind( 'touchmove mousemove', function( event ) {

        if ( !throttle ) {
            isDragging = true;

            if ( event.type == 'touchmove' ) {
                moveX = event.originalEvent.touches[ 0 ].pageX - lastX;
                moveY = event.originalEvent.touches[ 0 ].pageY - lastY;

                lastX = event.originalEvent.touches[ 0 ].pageX;
                lastY = event.originalEvent.touches[ 0 ].pageY;
            } else {
                if ( mousedown ) {
                    moveX = event.clientX - lastX;
                    moveY = event.clientY - lastY;

                    lastX = event.clientX;
                    lastY = event.clientY;
                }
            }

            event.preventDefault();
            throttle = true;
        }

    } ).bind( 'touchend mouseup', function() {

        isDragging = false;
        mousedown = false;

    } );

    /**
     * Sets the scale of the bubbles depending on how far from the center
     * of the screen they are
     */
    function setScale() {
        var icon;
        var iconCenterAdjust = iconWidth / 2;
        for ( var i = 0; i < totalIcons; i++ ) {
            var rect = iconContainers[ i ].getBoundingClientRect();

            var xDiff = Math.abs( viewPortCenterX - ( rect.left + iconCenterAdjust ) ) / viewportWidth;
            var yDiff = Math.abs( viewPortCenterY - ( rect.top + iconCenterAdjust ) ) / viewportHeight;

            var scale = Math.max( 1.1 - ( ( xDiff + yDiff ) ), 0.1 );

            $( icons[ i ] ).css( {
                transform: 'scale( ' + scale + ' ) translate3d( 0, 0, 0 )'
            } );
        }

    }

    function center( icon ) {
        var rect = icon.getBoundingClientRect();

        if ( rect.left > viewPortCenterX ) {
            moveX -= 1;
        }

        if ( rect.left < viewPortCenterX ) {
            moveX += 1;
        }

        if ( rect.top > viewPortCenterY ) {
            moveY -= 1;
        }

        if ( rect.top < viewPortCenterY ) {
            moveY += 1;
        }
    }

} )();
