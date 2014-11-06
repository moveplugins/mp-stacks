<?php
/**
 * Function which creates new Meta Box
 *
 */
function mp_stacks_content_create_meta_box(){	
	/**
	 * Array which stores all info about the new metabox
	 *
	 */
	$mp_stacks_content_add_meta_box = array(
		'metabox_id' => 'mp_stacks_content_metabox', 
		'metabox_title' => __( 'Brick\'s Content-Types', 'mp_stacks'), 
		'metabox_posttype' => 'mp_brick', 
		'metabox_context' => 'advanced', 
		'metabox_priority' => 'high' 
	);
	
	/**
	 * Array which stores all info about the options within the metabox
	 *
	 */
	$mp_stacks_content_types_array = array(
		array(
			'field_id'	 => 'brick_first_content_type',
			'field_title' => __( '1st Content Type', 'mp_stacks'),
			'field_description' => 'Select the first content type to use for this brick.',
			'field_type' => 'select',
			'field_value' => '',
			'field_select_values' => array('none' => 'None', 'text' => 'Text', 'image' => 'Image', 'video' => 'Video'),
			'field_popup_help' => esc_html(
				'<img class="mp-core-popup-help-float-right" src="' . MP_STACKS_PLUGIN_URL . 'assets/images/help-images/content-types/Content-Type-1.png" \/>
				<strong class="mp-ajax-popup-title">' . __( '1st Content-Type:', 'mp_stacks' ) . '</strong>
				' . __( 'If this brick is aligned "Left/Right", this is the content that will appear on the left side of the brick. If "Centered", it will sit at the top.', 'mp_stacks' )
			)
		),
		array(
			'field_id'	 => 'brick_second_content_type',
			'field_title' => __( '2nd Content Type', 'mp_stacks'),
			'field_description' => 'Select the second content type to use for this brick.',
			'field_type' => 'select',
			'field_value' => '',
			'field_select_values' => array('none' => 'None', 'text' => 'Text', 'image' => 'Image', 'video' => 'Video'),
			'field_popup_help' => esc_html(
				'<img class="mp-core-popup-help-float-right" src="' . MP_STACKS_PLUGIN_URL . 'assets/images/help-images/content-types/Content-Type-2.png" \/>
				<strong class="mp-ajax-popup-title">' . __( '2nd Content-Type:', 'mp_stacks' ) . '</strong>
				' . __( 'If this brick is aligned "Left/Right", this is the content that will appear on the right side of the brick. If "Centered", it will sit below the 1st Content-Type.', 'mp_stacks' )
			)
		),
		array(
			'field_id'	 => 'brick_alignment',
			'field_title' => __( 'Alignment', 'mp_stacks'),
			'field_description' => 'How would you like these content types to be aligned?',
			'field_type' => 'radio',
			'field_value' => 'leftright',
			'field_select_values' => array('leftright' => 'Left/Right', 'centered' => 'Centered', 'allleft' => 'All on left', 'allright' => 'All on right')
		),
	);
	
	
	/**
	 * Custom filter to allow for add-on plugins to hook in their own data for add_meta_box array
	 */
	$mp_stacks_content_add_meta_box = has_filter('mp_stacks_content_meta_box_array') ? apply_filters( 'mp_stacks_content_meta_box_array', $mp_stacks_content_add_meta_box) : $mp_stacks_content_add_meta_box;
	
	/**
	 * Custom filter to allow for add on plugins to hook in their own extra fields 
	 */
	$mp_stacks_content_types_array = has_filter('mp_stacks_content_types_array') ? apply_filters( 'mp_stacks_content_types_array', $mp_stacks_content_types_array) : $mp_stacks_content_types_array;
	
	/**
	 * Create Metabox class
	 */
	global $mp_stacks_content_meta_box;
	$mp_stacks_content_meta_box = new MP_CORE_Metabox($mp_stacks_content_add_meta_box, $mp_stacks_content_types_array);
}
add_action('mp_brick_metabox', 'mp_stacks_content_create_meta_box', 1);

function mp_stacks_alignment_radio_leftright_before(){
	echo '<img width="50px" src="' . plugins_url('assets/images/left-right.png', dirname( dirname( dirname(__FILE__) ) ) ) . '" />';	
}
add_action('mp_core_metabox_before_' . 'leftright' . '_radio_description', 'mp_stacks_alignment_radio_leftright_before'); 

function mp_stacks_alignment_radio_centered_before(){
	echo '<img width="50px" src="' . plugins_url('assets/images/centered.png', dirname( dirname( dirname(__FILE__) ) ) ) . '" />';	
}
add_action('mp_core_metabox_before_' . 'centered' . '_radio_description', 'mp_stacks_alignment_radio_centered_before'); 

function mp_stacks_alignment_radio_allonleft_before(){
	echo '<img width="50px" src="' . plugins_url('assets/images/all-on-left.png', dirname( dirname( dirname(__FILE__) ) ) ) . '" />';	
}
add_action('mp_core_metabox_before_' . 'allleft' . '_radio_description', 'mp_stacks_alignment_radio_allonleft_before'); 

function mp_stacks_alignment_radio_allonright_before(){
	echo '<img width="50px" src="' . plugins_url('assets/images/all-on-right.png', dirname( dirname( dirname(__FILE__) ) ) ) . '" />';	
}
add_action('mp_core_metabox_before_' . 'allright' . '_radio_description', 'mp_stacks_alignment_radio_allonright_before'); 

/**
 * Add "More Content Types..." as a content Type to the dropdown
 *
 * @since    1.0.0
 * @link     http://mintplugins.com/doc/
 * @param    array $args See link for description.
 * @return   void
 */
function mp_stacks_more_content_types_add_content_type( $mp_stacks_content_types_array ){	
	
	/**
	 * Array which stores all info about the options within the metabox
	 *
	 */
	$mp_stacks_content_types_array[0]['field_select_values']['more_content_types'] = __( 'More Content-Types...', 'mp_stacks' );
	$mp_stacks_content_types_array[1]['field_select_values']['more_content_types'] = __( 'More Content-Types...', 'mp_stacks' );
	
	return $mp_stacks_content_types_array;

}
add_filter('mp_stacks_content_types_array', 'mp_stacks_more_content_types_add_content_type', 999);