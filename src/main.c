#include <pebble.h>

#include "dsp.h"
#include "input.h"
#include "volume.h"
#include "playback.h"

#define KEY_ERROR     0
#define KEY_DATA_REQUEST  1
#define KEY_POWER  2
#define KEY_VOLUME  3
#define KEY_MUTE  4
#define KEY_INPUT_TITLE  5
#define KEY_INPUT_NAME  6
#define KEY_DSP_PROGRAM  7
#define KEY_PLAYBACK_MAIN  8
#define KEY_PLAYBACK_SUB  9
#define KEY_PLAYBACK_ELAPSED  10
#define KEY_PLAYBACK_STATUS  14

#define KEY_POWER_TOGGLE  999


#define BIG_MENUITEM_HEIGHT 44
#define SMALL_MENUITEM_HEIGHT 28


static Window *s_main_window;
static TextLayer *s_text_layer;

static Window *s_menu_window = NULL;
static MenuLayer *s_menu_layer;

static GBitmap *s_volume_icon;
static GBitmap *s_volumemuted_icon;
static GBitmap *s_power_icon;
static GBitmap *s_scene_icon;
static GBitmap *s_song_icon;
static GBitmap *s_input_icon;
static GBitmap *s_dsp_icon;

static Tuple *s_error;
static Tuple *s_power;
static Tuple *s_volume;
static Tuple *s_mute;
static Tuple *s_input_title;
static Tuple *s_input_name;
static Tuple *s_dsp_program;
static Tuple *s_playback_main;
static Tuple *s_playback_sub;
static Tuple *s_playback_elapsed;
static Tuple *s_playback_status;


/***** Main menu *****/


static uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  return 5;
}

static void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context) {
  switch(cell_index->row) {
    case 0:
      menu_cell_basic_draw(ctx, cell_layer, s_power->value->cstring, NULL, s_power_icon);
      break;
    case 1:
      menu_cell_basic_draw(ctx, cell_layer, s_volume->value->cstring, NULL, s_volume_icon);
      break;
    case 2:
      menu_cell_basic_draw(ctx, cell_layer, s_input_title->value->cstring, NULL, s_input_icon);
      break;
    case 3:
      menu_cell_basic_draw(ctx, cell_layer, s_dsp_program->value->cstring, NULL, s_dsp_icon);
      break;
    case 4:
    {
      if (s_playback_main && s_playback_sub) {
        menu_cell_basic_draw(ctx, cell_layer, s_playback_main->value->cstring, s_playback_sub->value->cstring, NULL);
      } else {
        menu_cell_basic_draw(ctx, cell_layer, "Nothing playing", NULL, NULL);
      }
      break;
    }
    default:
      break;
  }
}

static int16_t get_cell_height_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  return PBL_IF_ROUND_ELSE(
    menu_layer_is_index_selected(menu_layer, cell_index) ?
      MENU_CELL_ROUND_FOCUSED_SHORT_CELL_HEIGHT : MENU_CELL_ROUND_UNFOCUSED_TALL_CELL_HEIGHT,
    (cell_index->row != 4) ? SMALL_MENUITEM_HEIGHT : BIG_MENUITEM_HEIGHT);
}

static void select_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  switch(cell_index->row) {
    case 0:
    {
      DictionaryIterator *iter; 
      uint8_t value = 1; 
      app_message_outbox_begin(&iter); 
      dict_write_int(iter, KEY_POWER_TOGGLE, &value, 1, true); 
      dict_write_end(iter); 
      app_message_outbox_send(); 
      break;
    }
    case 1:
    {
      volume_window_push(s_volume->value->cstring, s_mute->value->cstring);
      break;
    }
    case 2:
    {
      DictionaryIterator *iter; 
      uint8_t value = 2; 
      app_message_outbox_begin(&iter); 
      dict_write_int(iter, KEY_DATA_REQUEST, &value, 1, true); 
      dict_write_end(iter); 
      app_message_outbox_send(); 
      break;
    }
    case 3:
    {
      init_dsp_program_action_menu();
      break;
    }
    case 4:
    {
      playback_window_push(s_input_title->value->cstring, s_playback_status->value->cstring,
              s_playback_main->value->cstring, s_playback_sub->value->cstring, s_playback_elapsed->value->cstring);
      break;
    }
    default:
      break;
  }
}

static void menu_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  
  s_power_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_POWER);
  s_volume_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUME);
  s_volumemuted_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUMEMUTED);
  s_scene_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_SCENE);
  s_song_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_SONG);
  s_input_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_INPUT);
  s_dsp_icon = gbitmap_create_with_resource(RESOURCE_ID_ICON_DSP);

  s_menu_layer = menu_layer_create(bounds);
  menu_layer_set_click_config_onto_window(s_menu_layer, window);
#if defined(PBL_COLOR)
  menu_layer_set_normal_colors(s_menu_layer, GColorBlack, GColorWhite);
  menu_layer_set_highlight_colors(s_menu_layer, GColorRed, GColorWhite);
#else
  menu_layer_set_normal_colors(s_menu_layer, GColorBlack, GColorWhite);
  menu_layer_set_highlight_colors(s_menu_layer, GColorWhite, GColorBlack);
#endif
  menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks) {
      .get_num_rows = get_num_rows_callback,
      .draw_row = draw_row_callback,
      .get_cell_height = get_cell_height_callback,
      .select_click = select_callback,
  });
  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

static void menu_unload(Window *window) {
  menu_layer_destroy(s_menu_layer);
  gbitmap_destroy(s_power_icon);
  gbitmap_destroy(s_volume_icon);
  gbitmap_destroy(s_volumemuted_icon);
  gbitmap_destroy(s_scene_icon);
  gbitmap_destroy(s_song_icon);
  gbitmap_destroy(s_input_icon);
  gbitmap_destroy(s_dsp_icon);
}


/* App message callback */

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  s_error = dict_find(iter, KEY_ERROR);
  s_power = dict_find(iter, KEY_POWER);
  s_volume = dict_find(iter, KEY_VOLUME);
  s_mute = dict_find(iter, KEY_MUTE);
  s_input_title = dict_find(iter, KEY_INPUT_TITLE);
  s_input_name = dict_find(iter, KEY_INPUT_NAME);
  s_dsp_program = dict_find(iter, KEY_DSP_PROGRAM);
  s_playback_main = dict_find(iter, KEY_PLAYBACK_MAIN);
  s_playback_sub = dict_find(iter, KEY_PLAYBACK_SUB);
  s_playback_elapsed = dict_find(iter, KEY_PLAYBACK_ELAPSED);
  s_playback_status = dict_find(iter, KEY_PLAYBACK_STATUS);
  
  if (s_error) {
    text_layer_set_text(s_text_layer, s_error->value->cstring);
  } else if (dict_find(iter, KEY_SCENE_COUNT)) {
    APP_LOG(APP_LOG_LEVEL_INFO, "Scene/input data received");
    init_input_action_menu(iter);
  } else {
    if (!s_menu_window) {
      // build menu now
      s_menu_window = window_create();
      window_set_window_handlers(s_menu_window, (WindowHandlers) {
        .load = menu_load,
        .unload = menu_unload,
      });
      window_stack_pop_all(false);
      window_stack_push(s_menu_window, true);
    } else {
      if (window_stack_get_top_window() == s_menu_window) {
        menu_layer_reload_data(s_menu_layer);
      } else {
        volume_window_refresh(s_volume->value->cstring, s_mute->value->cstring);
        playback_window_refresh(s_input_title->value->cstring, s_playback_status->value->cstring,
              s_playback_main->value->cstring, s_playback_sub->value->cstring, s_playback_elapsed->value->cstring);
      }
    }
  }
}

static void inbox_error_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "app message inbox failure: %d", reason);
}

/* Splash window */

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_text_layer = text_layer_create(GRect(0, 50, bounds.size.w, 100));
  text_layer_set_text(s_text_layer, "Connecting...");
  text_layer_set_font(s_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  text_layer_set_background_color(s_text_layer, GColorClear);
  layer_add_child(window_layer, text_layer_get_layer(s_text_layer));
  
  DictionaryIterator *iter; 
  uint8_t value = 1; 
  app_message_outbox_begin(&iter); 
  dict_write_int(iter, KEY_DATA_REQUEST, &value, 1, true); 
  dict_write_end(iter); 
  app_message_outbox_send(); 
}

static void window_unload(Window *window) {
  text_layer_destroy(s_text_layer);
}


/* Init */

static void init() {
  s_main_window = window_create();
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });

  app_message_register_inbox_received(inbox_received_handler);
  app_message_register_inbox_dropped(inbox_error_handler);
  app_message_open(1500, 100);

  
  window_stack_push(s_main_window, true);
}

static void deinit() {
  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}
