<?php
/**
 * Custom Post Types
 *
 * @package mp_stacks
 * @since mp_stacks 1.0
 */

/**
 * Brick Custom Post Type
 */
function mp_brick_post_type() {
	
	if (mp_core_get_option( 'mp_stacks_settings_general',  'enable_disable' ) != 'disabled' ){
		$brick_labels =  apply_filters( 'mp_stacks_brick_labels', array(
			'name' 				=> 'Bricks',
			'singular_name' 	=> 'Brick Item',
			'add_new' 			=> __('Add New Brick', 'mp_stacks'),
			'add_new_item' 		=> __('Add New Brick', 'mp_stacks'),
			'edit_item' 		=> __('Edit Brick', 'mp_stacks'),
			'new_item' 			=> __('New Brick', 'mp_stacks'),
			'all_items' 		=> __('Manage Bricks', 'mp_stacks'),
			'view_item' 		=> __('View Bricks', 'mp_stacks'),
			'search_items' 		=> __('Search Bricks', 'mp_stacks'),
			'not_found' 		=>  __('No Bricks found', 'mp_stacks'),
			'not_found_in_trash'=> __('No Bricks found in Trash', 'mp_stacks'), 
			'parent_item_colon' => '',
			'menu_name' 		=> __('Stacks & Bricks', 'mp_stacks')
		) );
		
			
		$brick_args = array(
			'labels' 			=> $brick_labels,
			'public' 			=> false,
			'publicly_queryable'=> false,
			'show_ui' 			=> true, 
			'show_in_menu' 		=> true, 
			'query_var' 		=> true,
			'rewrite' 			=> array( 'slug' => 'stack' ),
			'capability_type' 	=> 'post',
			'has_archive' 		=> false, 
			'hierarchical' 		=> true,
			'supports' 			=> apply_filters('mp_stacks_brick_supports', array( 'title') ),
		); 
		register_post_type( 'mp_brick', apply_filters( 'mp_stacks_brick_post_type_args', $brick_args ) );
	}
}
add_action( 'init', 'mp_brick_post_type', 0 );


 /**
 * Stacks taxonomy
 */
function mp_stacks_taxonomy() {  
	if (mp_core_get_option( 'mp_stacks_settings_general',  'enable_disable' ) != 'disabled' ){
		
		// Add new taxonomy, make it hierarchical (like categories)
		$labels = array(
			'name'                => __( 'Add Brick To Stacks', 'mp_core' ),
			'singular_name'       => __( 'Stack', 'mp_core' ),
			'search_items'        => __( 'Search Stacks', 'mp_core' ),
			'all_items'           => __( 'All Stacks', 'mp_core' ),
			'parent_item'         => __( 'Parent Stack', 'mp_core' ),
			'parent_item_colon'   => __( 'Parent Stack:', 'mp_core' ),
			'edit_item'           => __( 'Edit Stack', 'mp_core' ), 
			'update_item'         => __( 'Update Stack', 'mp_core' ),
			'add_new_item'        => __( 'Add New Stack', 'mp_core' ),
			'new_item_name'       => __( 'New Stack Name', 'mp_core' ),
			'menu_name'           => __( 'Manage Stacks', 'mp_core' ),
		); 	
  
		register_taxonomy(  
			'mp_stacks',  
			'mp_brick',  
			array(  
				'hierarchical' => true,  
				'label' => 'Stacks',  
				'labels' => $labels,  
				'query_var' => true,  
				'with_front' => false, 
				'rewrite' => array('slug' => 'stacks')  
			)  
		);  
	}
}  
add_action( 'init', 'mp_stacks_taxonomy' );  

 /**
 * Add ability to filter bricks by stack on "list all bricks" page
 */
function mp_stacks_restrict_bricks_by_stack() {
	global $typenow;
	$post_type = 'mp_brick'; // change HERE
	$taxonomy = 'mp_stacks'; // change HERE
	if ($typenow == $post_type) {
		$selected = isset($_GET[$taxonomy]) ? $_GET[$taxonomy] : '';
		$info_taxonomy = get_taxonomy($taxonomy);
		wp_dropdown_categories(array(
			'show_option_all' => __("Show All {$info_taxonomy->label}"),
			'taxonomy' => $taxonomy,
			'name' => $taxonomy,
			'orderby' => 'name',
			'selected' => $selected,
			'show_count' => true,
			'hide_empty' => true,
		));
	};
}

add_action('restrict_manage_posts', 'mp_stacks_restrict_bricks_by_stack');

function mp_stacks_convert_id_to_term_in_query($query) {
	global $pagenow;
	$post_type = 'mp_brick'; // change HERE
	$taxonomy = 'mp_stacks'; // change HERE
	$q_vars = &$query->query_vars;
	if ($pagenow == 'edit.php' && isset($q_vars['post_type']) && $q_vars['post_type'] == $post_type && isset($q_vars[$taxonomy]) && is_numeric($q_vars[$taxonomy]) && $q_vars[$taxonomy] != 0) {
		$term = get_term_by('id', $q_vars[$taxonomy], $taxonomy);
		$q_vars[$taxonomy] = $term->slug;
	}
}

add_filter('parse_query', 'mp_stacks_convert_id_to_term_in_query');

/**
 * Add each stack to the bricks button in the WP menu
 */
function mp_stacks_show_each_stack_in_menu(){
	
	$stacks = mp_core_get_all_terms_by_tax('mp_stacks');
 	
	foreach( $stacks as $id => $stack){
	
		add_submenu_page( 'edit.php?post_type=mp_brick', $stack, $stack, 'manage_options', add_query_arg( array('mp_stacks' => $id), 'edit.php?post_type=mp_brick' ) );
	}	
}
//add_action('admin_menu', 'mp_stacks_show_each_stack_in_menu');

/**
 * Make the "Manage Stacks" page link to lists of bricks instead of an archive page
 */
function remove_quick_edit( $actions, $tag ) {
		
	unset($actions['inline hide-if-no-js']);
	
	$actions['view'] = '<a href="' . add_query_arg( array('mp_stacks' => $tag->term_id), 'edit.php?post_type=mp_brick' ) . '">' . __("View Bricks in Stack", 'mp_stacks') . '</a>';
	
	return $actions;
}
add_filter('mp_stacks_row_actions','remove_quick_edit',10,2);

 /**
 * Hide Permalink output on single edit screen
 */
function mp_stacks_perm($return, $id, $new_title, $new_slug){
	global $post;
	if (isset($post->post_type)){
		if($post->post_type == 'mp_brick'){
			
			$return = NULL;
			
		}
	}

	return $return;
}
add_filter('get_sample_permalink_html', 'mp_stacks_perm', '',4);

 /**
 * Sort bricks on admin pages by stack order
 */
function mp_stacks_order_admin_bricks( $query ){
    
	if( !is_admin() )
        return;
		
	$stack_id = !empty($_GET['mp_stacks']) ? $_GET['mp_stacks'] : false;
	
	if ( !$stack_id )
		return;
		
    $screen = get_current_screen();
    if( 'edit' == $screen->base
    && 'mp_brick' == $screen->post_type
    && !isset( $_GET['orderby'] ) ){
        $query->set( 'meta_key', 'mp_stack_order_' . $stack_id );
		$query->set( 'orderby', 'meta_value_num' );
        $query->set( 'order', 'ASC' );
    }
}
add_action( 'pre_get_posts', 'mp_stacks_order_admin_bricks' );