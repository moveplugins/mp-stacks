jQuery(document).ready(function($){
	
	/**
	 * Creating a trigger that we can hook to when the screen is done resizing - rather than firing hundreds of times upon resize
	 *
	 */
	var mp_stacks_resize_timer;
	$(window).resize(function(){
		clearTimeout(mp_stacks_resize_timer);
		mp_stacks_resize_timer = setTimeout(mp_stacks_resize_end, 100);
	});
	
	/**
	 * This function fires when the screen is done resizing. Hook jquery functions to it.
	 *
	 */
	function mp_stacks_resize_end(){
		$(document).trigger( 'mp_stacks_resize_complete' );
		$('.mfp-content').trigger( 'mp_stacks_resize_complete' );
	}
	
	/**
	 * Override the appendContent function in magnificPopup
	 *
	 */
	$.magnificPopup.instance.appendContent = function(newContent, type) {
		
		//Get the instance
		var mfp = $.magnificPopup.instance;
        var proto = $.magnificPopup.proto;
	  	
		//Original appendContent function begins here
		mfp.content = newContent;
		
		//Here we add our custom check for youtube or vimeo
		var iframe_src = mfp.content.find('.mfp-iframe').attr('src');	
		if (iframe_src){
			if ( iframe_src.indexOf("youtube.com/embed") > -1 || iframe_src.indexOf("vimeo.com") > -1 ){
				
				//If it matches, add class mfp-video to mfp-content div
				mfp.contentContainer.addClass('mfp-video');
			}
		}
		
		//"Action Hook" trigger so Add-Ons can modify the magnific popup further
		$(window).trigger("mp_stacks_magnific_popup_content_modifier", mfp );
		
		//Continue with original appendContent function
		if(newContent) {
			if(mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
				mfp.currTemplate[type] === true) {
				// if there is no markup, we just append close button element inside
				if(!mfp.content.find('.mfp-close').length) {
					mfp.content.append(_getCloseBtn());
				}
			} else {
				mfp.content = newContent;
			}
		} else {
			mfp.content = '';
		}

		//_mfpTrigger(BEFORE_APPEND_EVENT);
		mfp.container.addClass('mfp-'+type+'-holder');

		mfp.contentContainer.append(mfp.content);
	
	};
	
	/**
	 * Modify the Magnific Popup to open using the popup source - and set sized and behaviours for Media like YouTube, JPGs, etc
	 *
	 */
	function mp_stacks_magnific_editor( popup_source ){
		$.magnificPopup.open({
			
			items: {
				src: popup_source
			},
  
			type: 'iframe', 
			
			callbacks: {
				
				open: function() {
					// Will fire when popup is opened
				},
				close: function() {
					//Will fire the popup is closed
				},
			
				//Change the type of popup this is based on what's in the src
				elementParse: function(item) {
				
					var extension = item.src.split('.').pop();
					
					switch(extension) {
						case 'jpg':
						case 'png':
						case 'gif':
						item.type = 'image';
						break;
						case 'html':
						item.type = 'ajax';
						break;
						default:
						item.type = 'iframe';
					}
				}
			},
			
			patterns: {
							
				youtube: {
					index: 'youtube.com/watch', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).
					
					id: 'v=', // String that splits URL in a two parts, second part should be %id%
					// Or null - full URL will be returned
					// Or a function that should return %id%, for example:
					// id: function(url) { return 'parsed id'; } 
					
					src: '//www.youtube.com/embed/%id%?autoplay=1' // URL that will be set as a source for iframe. 
				},
				vimeo: {
					index: 'vimeo.com/',
					id: '/',
					src: '//player.vimeo.com/video/%id%?autoplay=1'
				},
				gmaps: {
					index: '//maps.google.',
					src: '%id%&output=embed'
				}
				
				// you may add here more sources
			
			},
			
			mainClass: 'mp-stacks-iframe-full-screen',
			
			srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
			
			preloader: true
	
		}, 0);
	
	}

	/**
	 * Set the class names of links which should open a full-size magnific popup
	 *
	 */
	$(document).on('click', '.mp-brick-edit-link, .mp-brick-add-before-link, .mp-brick-add-after-link, .mp-brick-reorder-bricks, .mp-brick-add-new-link, .mp-stacks-lightbox-link', function(event){ 
		event.preventDefault();
		//Call the function which opens our customized magnific popup for mp stacks
		mp_stacks_magnific_editor( $(this).attr('href') );
	});	
	
	/**
	 * Modify the Magnific Popup to open using the popup source - and set sized for height of content
	 *
	 */
	function mp_stacks_magnific_height_match( popup_source, width ){
		$.magnificPopup.open({
			
			items: {
				src: popup_source
			},
			type: 'iframe',
			iframe: {
				markup: '<div class="mfp-iframe-height-match" style="width:100%; max-width:' + width + ';">'+
				'<iframe class="mfp-iframe" frameborder="0" scrolling="yes" onload="javascript:mp_stacks_mfp_match_height(this);" style="width:100%;" allowfullscreen></iframe>'+
				'<div class="mfp-close"></div>'+
				'</div>'
			},
			callbacks: {
				open: function() {
					// Will fire when popup is opened
				},
				close: function() {
					//Will fire the popup is closed
					$( document ).off( "mp_stacks_mfp_match_height_trigger", '.mfp-content' );
					$( document ).off( "mp_stacks_resize_complete", '.mfp-content' );
				}
				
			},
			mainClass: 'mp-stacks-iframe-height-match',
			preloader: true
		
		}, 0);
	
	}
	
	/**
	 * Set items with the class 'mp-stacks-iframe-height-match-lightbox-link' to open a lightbox iframe matching the height of its contents 
	 * and at the width defined in its 'mfp-width' attribute
	 */		
	$(document).on( 'click', '.mp-stacks-iframe-height-match-lightbox-link', function( event ){
		
		event.preventDefault();
		
		//Call the function which opens our customized magnific popup for mp stacks
		mp_stacks_magnific_height_match( $(this).attr('href'), $( this ).attr( 'mfp-width' ) );
		
		//Set the mfp-content div to be the width we want for this popup
		$( '.mp-stacks-iframe-height-match .mfp-content' ).css( 'width', $( this ).attr( 'mfp-width' ) );
		
	});
	
	/**
	 * Modify the Magnific Popup to open using the popup source - and set sized for height of content
	 *
	 */
	function mp_stacks_magnific_custom_width_height( popup_source, width, height ){
		$.magnificPopup.open({
			
			items: {
				src: popup_source
			},
			type: 'iframe',
			iframe: {
				markup: '<div class="mfp-iframe-custom-width-height" style="width:100%; height:100%;">'+
				'<iframe class="mfp-iframe" frameborder="0" scrolling="yes" style="width:100%; height:100%;" allowfullscreen></iframe>'+
				'<div class="mfp-close"></div>'+
				'</div>'
			},
			callbacks: {
				open: function() {
					// Will fire when popup is opened
				},
				close: function() {
					//Will fire the popup is closed
					$( document ).off( "mp_stacks_mfp_match_height_trigger", '.mfp-content' );
					$( document ).off( "mp_stacks_resize_complete", '.mfp-content' );
				}
				
			},
			mainClass: 'mp-stacks-iframe-custom-width-height',
			preloader: true
		
		}, 0);
	
	}
	
	/**
	 * Set items with the class 'mp-stacks-iframe-custom-width-height' to open a lightbox iframe
	 * at the width defined in its 'mfp-width' attribute
	 * at the height defined in its 'mfp-height' attribute
	 */		
	$(document).on( 'click', '.mp-stacks-iframe-custom-width-height', function( event ){
		
		event.preventDefault();
		
		//Call the function which opens our customized magnific popup for mp stacks
		mp_stacks_magnific_custom_width_height( $(this).attr('href'), $( this ).attr( 'mfp-width' ), $( this ).attr( 'mfp-height' ) );
		
		//Set the mfp-content div to be the width and height we want for this popup
		$( '.mp-stacks-iframe-custom-width-height .mfp-content' ).css( 'width', $( this ).attr( 'mfp-width' ) );
		$( '.mp-stacks-iframe-custom-width-height .mfp-content' ).css( 'max-width', '100%' );
		$( '.mp-stacks-iframe-custom-width-height .mfp-content' ).css( 'height', $( this ).attr( 'mfp-height' ) );
		$( '.mp-stacks-iframe-custom-width-height .mfp-content' ).css( 'max-height', '100%' );
		
	});
	
	//If the URL variable mplsmh (Stand for: mp lightbox source matched height) is set,
	//open the value of it in a lightbox upon page load at the specified width and mathing the height of the contents
	if ( mp_stacks_getQueryVariable( 'mplsmh' ) ){
		
		//Call the function which opens our customized magnific popup for mp stacks
		mp_stacks_magnific_height_match( mp_stacks_getQueryVariable( 'mplsmh' ), mp_stacks_getQueryVariable( 'width' )  );
		
		//Set the mfp-content div to be the width we want for this popup
		$( '.mp-stacks-iframe-height-match .mfp-content' ).css( 'width', mp_stacks_getQueryVariable( 'width' ) );
	}
		
	/**
	 * Upon Double Click, Open the Brick Editor
	 *
	 */
	$(document).on('dblclick', '.mp-brick', function(){ 
		//Call the function which opens our customized magnific popup for mp stacks
		mp_stacks_magnific_editor($(this).find('.mp-brick-edit-link').attr('href'));
	});	
	
	/**
	 * Perform smooth scroll when brick's achored are linked to
	 *
	 */
	$(function() {
	  $('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		  var target = $(this.hash);
		  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		  if (target.length) {
			$('html,body').animate({
			  scrollTop: target.offset().top
			}, 1000);
			return false;
		  }
		}
	  });
	});
			
	/**
	 * Upon Resize, Set the font size of a brick to max out based on its longest word fitting into the width of the page
	 *
	 */
	$(window).on('mp_stacks_resize_complete load', function(){
		mp_stacks_check_text_size();
	});
	
	
	/**
	 * Set the font size of a brick to max out based on its longest word fitting into the width of the page
	 *
	 */
	function mp_stacks_check_text_size(){	
	
		var run_check_again_when_finished = false;
		
		//Temporarily set all brick p's and a's to be inline-block
		$('head').find('#mp-stacks-text-resize-temp-styles').remove();
		$('head').append('<style id="mp-stacks-text-resize-temp-styles" type="text/css">.mp_brick p,.mp_brick a{display:inline-block;text-decoration:none;}</style>');
		
		//Loop through each text-line-1 type brick on the page
		$('.mp-brick').each( function(){
			
			var brick = $(this);
			
			var brick_id = $(this).attr('id');
			
			var brick_outer_width = $(this).find('.mp-brick-outer').innerWidth() - ( parseFloat($(this).find('.mp-brick-first-content-type').css('padding-left')) + parseFloat($(this).find('.mp-brick-first-content-type').css('padding-right')) );
			
			//Debug
			//console.log( "Brick ID: " + brick_id + "| Allowable Width: " + brick_outer_width);
			
			var largest_font_size = 0;
			var largest_width_px = 0;
			
			var a_counter = 0;
			
			var main_element_to_change;
			var all_elements_to_change = new Object;
			
			var size_counter = 0;
			
			//Loop through each element in this brick
			brick.find('p').each( function(){
				
				//Get the font size of this element
				this_font_size = parseFloat( $(this).css('font-size') );
				
				//If this element has the same font size as the largest we've seen yet
				if ( this_font_size == largest_font_size ){
					
					//If this element (with the same font size as largest) is wider than the largest we've found, make this the main one
					if ( $(this).width() > largest_width_px ){
						main_element_to_change = $(this);
						largest_width_px = $(this).width();
					}
					
					all_elements_to_change[size_counter] = $(this);
				}
				//If this element has the largest font size we've seen yet
				else if ( this_font_size > largest_font_size ){
					largest_font_size = this_font_size;
					
					//If this element has the largest font size AND is wider than the largest we've found, make this the main one
					if ( $(this).width() > largest_width_px ){
						main_element_to_change = $(this);
						largest_width_px = $(this).width();
					}
				
					all_elements_to_change[size_counter] = $(this);
				}
				//If this element has a smaller font size than we've seen yet
				else if ( this_font_size < largest_font_size ){
					
					//If this element wider than the largest we've found, make this the main one (this only happens if a word is really long with a smaller font size)
					if ( $(this).width() > largest_width_px ){
						main_element_to_change = $(this);
						largest_width_px = $(this).width();
						all_elements_to_change[size_counter] = $(this);
					}
				
				}
				
				
				size_counter = size_counter + 1;
				
			});
			
			//If there is a text element in this brick - and it has the largest font size in the brick
			if ( main_element_to_change ){
				var resize_counter = 0;
				
				var changed_a_elements = new Object;
				
				//Loop through the elements that need to change (with biggest font size and elements equal to the biggest font size)
				$.each( all_elements_to_change, function( index, element_to_change ){
					//If the element to change is an a tag, which doens't capture the size updates for some unknown reason, convert it to a div for now
					if ( element_to_change.is("a") ){
						
						//increment a counter (used for key in object)
						a_counter = a_counter + 1;
							
						//convert it to a div for now
						var new_div_element = element_to_change.mp_stacks_changeElementType('div');
						
						//Store this element in the object of a elements we changed
						changed_a_elements.a_counter = new_div_element;
						
					}	
					
					//Loop through each element in the element to change
					element_to_change.find('*').each(function(){
						
						var element_inside_element_to_change = $(this);
						
						//If the element to change is an a tag, which doens't capture the size updates for some unknown reason
						if ( element_inside_element_to_change.is("a") ){
							
							//increment a counter (used for key in object)
							a_counter = a_counter + 1;
							
							//convert it to a div for now
							var new_div_element = element_inside_element_to_change.mp_stacks_changeElementType('div');
							
							//Store this element in the object of a elements we changed
							changed_a_elements.a_counter = new_div_element;
							
						}	
					
					});
				});
				
				//If the width of this element is larger than our brick width, the font is too big
				while ( main_element_to_change.width() > brick_outer_width ){
					
					//We've got a sizing issue - so to double check all once this is completed, we'll run it again using this true setting
					run_check_again_when_finished = true;
					
					//If we've resized this text more than 50 times, there's likely another reason why this isn't shrinking so we won't keep going. 
					if ( resize_counter > 50 ){
						//This makes sure we don't crash computers if something we hadn't thought of happens
						run_check_again_when_finished = false;
						break;	
					}
					
					//Reduce the font size by 10% of what it is now
					var new_font_size = parseFloat(main_element_to_change.css('font-size')) * .9;
					
					//Loop through the elements that need to change (with biggest font size and elements equal to the biggest font size)
					$.each( all_elements_to_change, function( index, element_to_change ){
						
						element_to_change.css('font-size', new_font_size );
						element_to_change.find('*').css('font-size', new_font_size );
						element_to_change.css('line-height', '1.2em');
						element_to_change.find('*').css('line-height', '1.2em');
						
					});
					
					//Resize Counter
					resize_counter = resize_counter + 1;
					
					//Debug:
					//console.log( " | Counter " + resize_counter + " | Font-Size: " + main_element_to_change.css('font-size') + " | This P Width: " + main_element_to_change.width() + " | This Outer Ruler Width: " + brick_outer_width );
					
				}
				
				//Change all a elements back into a elements
				$.each(changed_a_elements, function(index, changed_a_element){
					
					changed_a_element.mp_stacks_changeElementType('a');	
					
				});
				
				//Loop through the elements that we changed and remove the display:inline-block inline we added
				$.each( all_elements_to_change, function( index, element_we_changed ){
					
					element_we_changed.css('display', '' );
					
				});
				
			}
				
		});
		
		//Remove the temp display:inline-block for all brick p's and a's
		$('head').find('#mp-stacks-text-resize-temp-styles').remove();
		
		//If we just made a change, check it all again in case others need changing post-change
		if ( run_check_again_when_finished ){
			mp_stacks_check_text_size();
		}
	
	}
	
	/**
	 * Load more posts into a Grid.
	 *
	 */
	$( document ).on( 'click', '.mp-stacks-grid-load-more-button', function(event){
		
		event.preventDefault();
		
		//Change the message on the Load More button to say "Loading..."
		$(this).html($(this).attr( 'mp_stacks_grid_loading_text' ));
		
		// Use ajax to load more posts
		var postData = {
			action: 'mp_stacks_' + $(this).attr( 'mp_stacks_grid_ajax_prefix' ) + '_load_more',
			mp_stacks_grid_post_id: $(this).attr( 'mp_stacks_grid_post_id' ),
			mp_stacks_grid_offset: $(this).attr( 'mp_stacks_grid_brick_offset' ),
			mp_stacks_grid_post_counter: $(this).attr( 'mp_stacks_grid_post_counter' ),
		}
		
		//Are we using Masonry?
		var masonry_on = eval( 'masonry_grid_' + $(this).attr( 'mp_stacks_grid_post_id' ) );
		
		var the_grid_container = $(this).parent().prev();
		var the_button_container = $(this).parent();
		var the_after_container = $(this).parent().parent().find('.mp-stacks-grid-after');
		
		//Ajax load more posts
		$.ajax({
			type: "POST",
			data: postData,
			dataType:"json",
			url: mp_stacks_frontend_vars.ajaxurl,
			success: function (response) {
				
				var $newitems = $(response.items);
				$newitems.css('visibility', 'hidden' );
				
				//Add the new items to the page
				if ( masonry_on ){
					the_grid_container.append($newitems).imagesLoaded( function(){ the_grid_container.masonry('appended', $newitems) });
				}
				else{
					the_grid_container.append($newitems);
				}
				
				$newitems.css('visibility', 'visible' );
				
				//Add the updated "Load More" button to the page
				the_button_container.replaceWith(response.button);
				
				//Add the animation trigger which resets animations on newly added items
				the_after_container.html(response.animation_trigger);
				
				//Refresh waypoints to reflect new page size
				var refresh_counter = 0;
				var refresh_waypoints = setInterval(function() {
					
					//Clear loop after 20 refreshes
					if ( refresh_counter > 20 ){
						clearInterval(refresh_waypoints);
					}
					//Refresh Waypoints
					$.waypoints('refresh');
					//Increment Refresh Counter
					refresh_counter = refresh_counter + 1;
				}, 25);	
			
			}
		}).fail(function (data) {
			console.log(data);
		});	
		
	});
	
	/**
	 * jQuery Plugin to Change an Element Type
	 *
	 */
	$.fn.mp_stacks_changeElementType = function(newType) {
		
		var attrs = {};
	
		$.each(this[0].attributes, function(idx, attr) {
			attrs[attr.nodeName] = attr.value;
		});
	
		var newelement = $("<" + newType + "/>", attrs).append($(this).contents());
		this.replaceWith(newelement);
		return newelement;
	};

});

//Close the lightbox when the update button is clicked
function mp_stacks_close_lightbox(){
	
	//Close the iframe and reload the window
	jQuery(document).ready(function($){
				
		$('.mfp-iframe, .mfp-close').hide();
		
		$('.mfp-content').css( 'width', 'initial' );
		$('.mfp-content').css( 'height', 'initial' );
		
		$('.mfp-content').prepend('<div class="mp-stacks-brick-updating" style="color:#fff; visibility:hidden; text-align: center;"><div class="mp-stacks-updating-message">' + mp_stacks_frontend_vars.updating_message + '</div><img width="100px" src="' + mp_stacks_frontend_vars.stacks_plugin_url + 'assets/images/Stacks-Icon-Gif.gif" /></div>');
		
		$('.mfp-content .mp-stacks-brick-updating').css('visibility', 'visible');
		
		//Close iframe and refresh
		$('.mfp-iframe').load(function(){
			$.magnificPopup.instance.close();
			location.reload();
		});
	});
}

//This function can be used to set an iframe's height to match the height of its contents.
function mp_stacks_mfp_match_height(iframe) {
	
	jQuery(document).ready(function($){
		
		var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
		if (iframeWin.document.body) {
			
			//We use an interval to loop the resize function several times to make sure the iframe's content is fully loaded
			var iframe_height_interval_counter = 1;
			var iframe_height_interval = setInterval( function(){
				iframe.height = iframeWin.document.documentElement.scrollHeight + 'px' || iframeWin.document.body.scrollHeight + 'px';
				iframe_height_interval_counter = iframe_height_interval_counter + 1;
				if ( iframe_height_interval_counter >= 25 ){
					clearInterval(iframe_height_interval);	
				}
			}, 100 );
		}
		
		//This function is fired upon screen resize (and the mp_stacks_mfp_match_height_trigger) so that the height continues to match the contents of the iframe
		$( document ).on( 'mp_stacks_resize_complete mp_stacks_mfp_match_height_trigger', '.mfp-content', function(){
			mp_stacks_mfp_match_height( iframe );
		});

	
	});
};

//Allow events in iframes to trigger the 'mp_stacks_mfp_match_height' event by calling this function using parent.mp_stacks_mfp_match_height_trigger()
function mp_stacks_mfp_match_height_trigger(){
	jQuery(document).ready(function($){
		$( '.mfp-content' ).trigger( 'mp_stacks_mfp_match_height_trigger' );	
	});
}

//Check for old versions of Browsers that suck
if(  !document.addEventListener  ){
	alert("Your Internet Browser is out of date and is at risk for being hacked and your personal information stolen. Please upgrade to a secure browser like Google Chrome or Firefox.");
}

//This function allows us to grab URL variables
function mp_stacks_getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}