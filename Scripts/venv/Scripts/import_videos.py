import os
import re
import json
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from pathlib import Path

load_dotenv()

BUNNY_API_KEY = os.getenv('BUNNY_API_KEY')
BUNNY_LIBRARY_ID = os.getenv('BUNNY_LIBRARY_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_KEY:
    print("⚠️  SUPABASE_SERVICE_ROLE_KEY not found, trying SUPABASE_KEY...")
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Map collection IDs directly to course types (takes precedence over name matching)
# This ensures collections are correctly categorized even if names don't match
COLLECTION_ID_TO_COURSE_TYPE = {
    # Lathe collections
    '2c194c4b-d61a-4241-a76c-53180174599d': 'Lathe',  # Lathe- C Axis
    'efc37b85-b1ea-4b73-9dce-46ca085cd1b5': 'Lathe',  # Lathe Basic
    
    # Mill collections
    '11a5bae7-4634-4b61-9cae-f44198d31b0d': 'Mill',  # Mill - Setup
    'ea0e530a-d7c0-4c6f-a03f-525444a7373e': 'Mill',  # Mill-Design basic
    
    # Mill 3D collections
    '4fad690f-e980-4ef8-beb2-229ce588090e': 'Mill 3D',  # Mill 3D
    
    # Multi-Axis collections
    '8471fd95-26a3-4058-b39a-552a4a84a449': 'Multi-Axis',  # 5-axis
    '8b070b0c-2040-4bae-8325-409c36ea6380': 'Multi-Axis',  # Multi-axis training vids
}

# Map collection names to course types
# Update these collection names to match your Bunny.net collection folder names
COLLECTION_TO_COURSE_TYPE = {
    'mill': 'Mill',
    'lathe': 'Lathe',
    'lathe- c axis': 'Lathe',
    'lathe c axis': 'Lathe',
    'lathe basic': 'Lathe',
    'mill-3d': 'Mill 3D',
    'mill 3d': 'Mill 3D',
    'mill3d': 'Mill 3D',
    'mill - setup': 'Mill',
    'mill setup': 'Mill',
    'mill-design basic': 'Mill',
    'mill design basic': 'Mill',
    'multi-axis': 'Multi-Axis',
    'multi axis': 'Multi-Axis',
    'multiaxis': 'Multi-Axis',
    'multi-axis training vids': 'Multi-Axis',
    'multi axis training vids': 'Multi-Axis',
    '5-axis': 'Multi-Axis',
    '5axis': 'Multi-Axis',
    '5 axis': 'Multi-Axis',  # Added space variant
}

# Specify which collections to process (by name or ID)
# This is useful if you have duplicates in your Bunny.net library and only want
# to import videos from specific collections, avoiding duplicates.
#
# Leave empty list [] to process all collections that match course types
# Or specify exact collection names/IDs to only process those
#
# Examples:
#   COLLECTIONS_TO_PROCESS = ['Mill', 'Lathe']  # Only process collections named "Mill" or "Lathe"
#   COLLECTIONS_TO_PROCESS = ['collection-id-1', 'collection-id-2']  # Only process by collection ID
#   COLLECTIONS_TO_PROCESS = ['mill', 'lathe', 'mill-3d']  # Case-insensitive name matching
#   COLLECTIONS_TO_PROCESS = []  # Process all matching collections (default)
COLLECTIONS_TO_PROCESS = [
    # Lathe collections
    '2c194c4b-d61a-4241-a76c-53180174599d',  # Lathe- C Axis
    'efc37b85-b1ea-4b73-9dce-46ca085cd1b5',  # Lathe Basic
    
    # Mill collections
    '11a5bae7-4634-4b61-9cae-f44198d31b0d',  # Mill - Setup
    'ea0e530a-d7c0-4c6f-a03f-525444a7373e',  # Mill-Design basic
    
    # Mill 3D collections
    '4fad690f-e980-4ef8-beb2-229ce588090e',  # Mill 3D
    
    # Multi-Axis collections
    '8471fd95-26a3-4058-b39a-552a4a84a449',  # 5-axis
    '8b070b0c-2040-4bae-8325-409c36ea6380',  # Multi-axis training vids
]  # Only process these specific collections by ID


def fetch_collections():
    """Fetch all collections from Bunny.net API"""
    print("📁 Fetching collections from Bunny.net...")
    print(f"   Library ID: {BUNNY_LIBRARY_ID}")
    print(f"   API Key: {BUNNY_API_KEY[:10]}..." if BUNNY_API_KEY else "   API Key: NOT SET")
    
    # Try different possible endpoints
    endpoints = [
        f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/collections",
        f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/folders",
    ]
    
    headers = {'AccessKey': BUNNY_API_KEY}
    
    for url in endpoints:
        print(f"   Trying endpoint: {url}")
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"   Response status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    collections = response.json()
                    print(f"   Response type: {type(collections)}")
                    
                    # Handle different response formats
                    if isinstance(collections, list):
                        print(f"✅ Found {len(collections)} collections")
                        if collections:
                            print(f"   Sample collection: {collections[0]}")
                        print()
                        return collections
                    elif isinstance(collections, dict):
                        if 'items' in collections:
                            items = collections.get('items', [])
                            print(f"✅ Found {len(items)} collections in 'items'")
                            if items:
                                print(f"   Sample collection: {items[0]}")
                            print()
                            return items
                        elif 'data' in collections:
                            items = collections.get('data', [])
                            print(f"✅ Found {len(items)} collections in 'data'")
                            if items:
                                print(f"   Sample collection: {items[0]}")
                            print()
                            return items
                        else:
                            print(f"   ⚠️  Dict response but no 'items' or 'data' key")
                            print(f"   Keys: {list(collections.keys())}")
                            # Try to return the dict itself if it looks like a collection
                            print(f"   Trying to parse as single collection...")
                            return [collections] if collections else []
                    else:
                        print(f"⚠️  Unexpected collections response format: {type(collections)}")
                        print(f"   Response preview: {str(collections)[:200]}")
                        continue
                except Exception as e:
                    print(f"⚠️  Error parsing collections response from {url}: {e}")
                    print(f"   Response text: {response.text[:500]}")
                    continue
            elif response.status_code == 404:
                print(f"   ⚠️  Endpoint not found: {url}")
                continue
            else:
                print(f"   ⚠️  Error {response.status_code} from {url}")
                print(f"   Response: {response.text[:500]}")
                continue
        except requests.exceptions.RequestException as e:
            print(f"   ⚠️  Request error for {url}: {e}")
            continue
    
    print(f"❌ Could not fetch collections from any endpoint")
    print(f"   Tried: {', '.join(endpoints)}")
    return []


def fetch_videos_by_collection(collection_id=None, collection_name=None, all_videos_cache=None):
    """Fetch videos from Bunny.net API, optionally filtered by collection
    
    If collection_id is provided, tries to filter by collectionId parameter.
    If that fails or isn't supported, filters from all_videos_cache by checking
    each video's collectionId field.
    """
    if collection_id:
        print(f"📥 Fetching videos from collection: {collection_name or collection_id}...")
    else:
        print("📥 Fetching all videos from Bunny.net...")
    
    all_videos = []
    page = 1
    
    # Try to fetch with collection filter first
    if collection_id:
        while True:
            url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos"
            params = {
                'page': page,
                'itemsPerPage': 100,
                'orderBy': 'title',
                'collectionId': collection_id
            }
            
            headers = {'AccessKey': BUNNY_API_KEY}
            
            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code != 200:
                # If filtering by collectionId parameter fails, fall back to filtering all videos
                print(f"   ⚠️  Collection filtering via API parameter not supported (status {response.status_code})")
                print(f"   Response: {response.text[:300]}")
                print(f"   Falling back to filtering all videos by collectionId field...")
                if all_videos_cache is not None:
                    # Filter from cache
                    print(f"   Checking {len(all_videos_cache)} videos for collectionId = {collection_id}")
                    
                    # Debug: show sample video structure
                    if all_videos_cache:
                        sample_video = all_videos_cache[0]
                        print(f"   Sample video keys: {list(sample_video.keys())}")
                        if 'collectionId' in sample_video:
                            print(f"   Sample video collectionId: {sample_video.get('collectionId')} (type: {type(sample_video.get('collectionId'))})")
                        else:
                            print(f"   ⚠️  Videos don't have 'collectionId' field!")
                            # Check for alternative field names
                            for key in sample_video.keys():
                                if 'collection' in key.lower():
                                    print(f"   Found alternative field: {key} = {sample_video.get(key)}")
                    
                    filtered = [v for v in all_videos_cache if v.get('collectionId') == collection_id or 
                               str(v.get('collectionId')) == str(collection_id)]
                    
                    if not filtered:
                        print(f"   ⚠️  No videos found with collectionId = {collection_id}")
                        print(f"   Checking first 5 videos' collectionIds:")
                        for i, v in enumerate(all_videos_cache[:5]):
                            print(f"      Video {i+1}: collectionId = {v.get('collectionId')} (type: {type(v.get('collectionId'))})")
                    
                    print(f"✅ Found {len(filtered)} videos in collection '{collection_name}' from cache\n")
                    return filtered
                else:
                    # Need to fetch all videos first
                    print(f"   Fetching all videos first...")
                    all_videos_cache = fetch_all_bunny_videos()
                    filtered = [v for v in all_videos_cache if v.get('collectionId') == collection_id or 
                               str(v.get('collectionId')) == str(collection_id)]
                    print(f"✅ Found {len(filtered)} videos in collection '{collection_name}'\n")
                    return filtered
            
            try:
                data = response.json()
                # Handle different response formats
                if isinstance(data, list):
                    items = data
                elif isinstance(data, dict):
                    items = data.get('items', [])
                else:
                    print(f"⚠️  Unexpected response format: {type(data)}")
                    break
                
                if not items:
                    break
                
                all_videos.extend(items)
                print(f"   Fetched page {page}: {len(items)} videos")
                
                if len(items) < 100:
                    break
                
                page += 1
            except Exception as e:
                print(f"❌ Error parsing response: {e}")
                print(f"   Response: {response.text[:200]}")
                break
        
        print(f"✅ Total videos fetched from collection: {len(all_videos)}\n")
        return all_videos
    
    # Fetch all videos (no collection filter)
    while True:
        url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos"
        params = {
            'page': page,
            'itemsPerPage': 100,
            'orderBy': 'title'
        }
        
        headers = {'AccessKey': BUNNY_API_KEY}
        
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error fetching videos: {response.status_code}")
            print(f"   Response: {response.text}")
            break
        
        try:
            data = response.json()
            # Handle different response formats
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                items = data.get('items', [])
            else:
                print(f"⚠️  Unexpected response format: {type(data)}")
                break
            
            if not items:
                break
            
            all_videos.extend(items)
            print(f"   Fetched page {page}: {len(items)} videos")
            
            if len(items) < 100:
                break
            
            page += 1
        except Exception as e:
            print(f"❌ Error parsing response: {e}")
            print(f"   Response: {response.text[:200]}")
            break
    
    print(f"✅ Total videos fetched: {len(all_videos)}\n")
    return all_videos


def fetch_all_bunny_videos():
    """Fetch all videos from Bunny.net API (legacy function for backward compatibility)"""
    return fetch_videos_by_collection()


def load_manual_mappings():
    """Load manual video mappings from JSON file if it exists"""
    mapping_file = Path(__file__).parent / 'video_mapping.json'
    if mapping_file.exists():
        try:
            with open(mapping_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('rules', [])
        except:
            return []
    return []


def detect_course_type(title, manual_mappings=None):
    """Detect which course type a video belongs to based on title"""
    title_lower = title.lower()
    
    # First, check manual mappings (more specific rules)
    if manual_mappings:
        for rule in manual_mappings:
            pattern = rule.get('pattern', '')
            course_type = rule.get('course_type', '')
            case_sensitive = rule.get('case_sensitive', False)
            
            if pattern and course_type:
                flags = 0 if case_sensitive else re.IGNORECASE
                if re.search(pattern, title, flags):
                    return course_type
    
    # Check for Multi-Axis first (more specific, should be checked before general terms)
    # Check for various multi-axis patterns
    multi_axis_keywords = [
        'multi-axis', 'multi axis', 'multiaxis',
        '5-axis', '5 axis', '5axis', '5-axis',
        '4-axis', '4 axis', '4axis', '4-axis',
        'simultaneous', 'simultaneous machining'
    ]
    if any(keyword in title_lower for keyword in multi_axis_keywords):
        return 'Multi-Axis'
    
    # Check for Lathe
    lathe_keywords = ['lathe', 'turning', 'turn', 'turned']
    if any(keyword in title_lower for keyword in lathe_keywords):
        return 'Lathe'
    
    # Check for Mill 3D (check before general mill)
    mill_3d_keywords = [
        '3d', '3-d', 'three dimensional', '3 dimensional',
        'surface', 'surfacing', 'solid', 'solids',
        '3d milling', '3d mill', '3d machining'
    ]
    if any(keyword in title_lower for keyword in mill_3d_keywords):
        return 'Mill 3D'
    
    # Check for Mill (default for most CNC content)
    mill_keywords = ['mill', 'milling', 'cnc', 'mastercam']
    if any(keyword in title_lower for keyword in mill_keywords):
        return 'Mill'
    
    # Default to Mill if no match
    return 'Mill'


def parse_video_info(video, manual_mappings=None, course_type_override=None):
    """Parse video title to extract module, lesson numbers, and course type"""
    title = video.get('title', '').strip()
    # Remove .mp4 extension for parsing
    title_clean = re.sub(r'\.mp4$', '', title, flags=re.IGNORECASE)
    
    # Use course type from collection if provided, otherwise detect from title
    if course_type_override:
        course_type = course_type_override
    else:
        course_type = detect_course_type(title, manual_mappings)
    
    # Pattern: m01-l01-title or m1-l1-title
    match = re.match(r'm(\d+)-l(\d+)[-_](.+?)$', title_clean, re.IGNORECASE)
    if match:
        return {
            'video_id': video['guid'],
            'title': title,
            'duration_seconds': video.get('length', 0),
            'course_type': course_type,
            'module_number': int(match.group(1)),
            'lesson_number': int(match.group(2)),
            'slug': match.group(3).replace('-', ' ').replace('_', ' ').strip()
        }
    
    # Pattern: module-1-lesson-1-title
    match = re.match(r'module[-_](\d+)[-_]lesson[-_](\d+)[-_](.+?)$', title_clean, re.IGNORECASE)
    if match:
        return {
            'video_id': video['guid'],
            'title': title,
            'duration_seconds': video.get('length', 0),
            'course_type': course_type,
            'module_number': int(match.group(1)),
            'lesson_number': int(match.group(2)),
            'slug': match.group(3).replace('-', ' ').replace('_', ' ').strip()
        }
    
    # Pattern: 01-01-title
    match = re.match(r'^(\d+)[-_](\d+)[-_](.+?)$', title_clean)
    if match:
        return {
            'video_id': video['guid'],
            'title': title,
            'duration_seconds': video.get('length', 0),
            'course_type': course_type,
            'module_number': int(match.group(1)),
            'lesson_number': int(match.group(2)),
            'slug': match.group(3).replace('-', ' ').replace('_', ' ').strip()
        }
    
    # Pattern: Part 01, Part 02, etc. (extract lesson number)
    match = re.search(r'part[-_\s](\d+)', title_clean, re.IGNORECASE)
    if match:
        lesson_num = int(match.group(1))
        # Try to find module number, default to 1
        mod_match = re.search(r'module[-_\s]?(\d+)', title_clean, re.IGNORECASE)
        module_num = int(mod_match.group(1)) if mod_match else 1
        return {
            'video_id': video['guid'],
            'title': title,
            'duration_seconds': video.get('length', 0),
            'course_type': course_type,
            'module_number': module_num,
            'lesson_number': lesson_num,
            'slug': re.sub(r'\.mp4$', '', title, flags=re.IGNORECASE).strip()
        }
    
    # No pattern matched
    return {
        'video_id': video['guid'],
        'title': title,
        'duration_seconds': video.get('length', 0),
        'course_type': course_type,
        'module_number': None,
        'lesson_number': None,
        'slug': re.sub(r'\.mp4$', '', title, flags=re.IGNORECASE).strip()
    }


def organize_videos(videos, auto_organize_unmapped=True, videos_per_module=10, course_type_override=None):
    """Organize videos by course type and module"""
    if course_type_override:
        print(f"📋 Organizing videos for course type: {course_type_override}...")
    else:
        print("📋 Organizing videos by course type and module...")
    
    # Load manual mappings
    manual_mappings = load_manual_mappings()
    if manual_mappings:
        print(f"   📝 Loaded {len(manual_mappings)} manual mapping rules")
    
    parsed_videos = [parse_video_info(v, manual_mappings, course_type_override) for v in videos]
    
    # If course_type_override is provided, all videos go to that course type
    if course_type_override:
        courses_dict = {course_type_override: parsed_videos}
        print(f"\n📊 All {len(parsed_videos)} videos assigned to: {course_type_override}")
    else:
        # Group by course type
        courses_dict = {
            'Lathe': [],
            'Mill': [],
            'Mill 3D': [],
            'Multi-Axis': []
        }
        
        for video in parsed_videos:
            course_type = video.get('course_type', 'Mill')
            courses_dict[course_type].append(video)
        
        print(f"\n📊 Videos by course type:")
        for course_type, videos_list in courses_dict.items():
            print(f"   {course_type}: {len(videos_list)} videos")
    
    # Organize each course
    organized_by_course = {}
    
    for course_type, videos_list in courses_dict.items():
        if not videos_list:
            continue
            
        print(f"\n📚 Organizing {course_type} course...")
        
        organized = [v for v in videos_list if v['module_number'] is not None]
        unorganized = [v for v in videos_list if v['module_number'] is None]
        
        # Auto-organize unmapped videos if requested
        if unorganized and auto_organize_unmapped:
            print(f"   📦 Auto-organizing {len(unorganized)} unmapped videos...")
            current_module = 1
            current_lesson = 1
            
            for video in unorganized:
                video['module_number'] = current_module
                video['lesson_number'] = current_lesson
                organized.append(video)
                
                current_lesson += 1
                if current_lesson > videos_per_module:
                    current_module += 1
                    current_lesson = 1
            
            print(f"   ✅ Organized into {current_module} module(s) with {videos_per_module} videos each")
        elif unorganized:
            print(f"   ⚠️  Warning: {len(unorganized)} videos couldn't be parsed")
        
        if not organized:
            print(f"   ❌ No videos could be organized for {course_type}!")
            continue
        
        # Organize into modules
        modules_dict = {}
        for video in organized:
            mod_num = video['module_number']
            if mod_num not in modules_dict:
                modules_dict[mod_num] = []
            modules_dict[mod_num].append(video)
        
        for mod_num in modules_dict:
            modules_dict[mod_num].sort(key=lambda x: x['lesson_number'])
        
        organized_by_course[course_type] = {
            'modules': modules_dict,
            'videos': organized
        }
        
        print(f"   ✅ Organized {len(organized)} videos into {len(modules_dict)} modules")
    
    print("\n")
    return organized_by_course


def create_or_get_course(course_type):
    """Create or get a course by type in Supabase"""
    course_configs = {
        'Lathe': {
            'slug': 'lathe-operations',
            'title_vi': 'Lập trình Lathe',
            'title_en': 'Lathe Operations',
            'description_vi': 'Khóa học lập trình máy tiện CNC',
            'order_index': 2
        },
        'Mill': {
            'slug': 'mill-operations',
            'title_vi': 'Lập trình Mill',
            'title_en': 'Mill Operations',
            'description_vi': 'Khóa học lập trình máy phay CNC',
            'order_index': 1
        },
        'Mill 3D': {
            'slug': 'mill-3d-operations',
            'title_vi': 'Lập trình Mill 3D',
            'title_en': 'Mill 3D Operations',
            'description_vi': 'Khóa học lập trình phay 3D',
            'order_index': 3
        },
        'Multi-Axis': {
            'slug': 'multi-axis-operations',
            'title_vi': 'Lập trình Multi-Axis',
            'title_en': 'Multi-Axis Operations',
            'description_vi': 'Khóa học lập trình đa trục',
            'order_index': 4
        }
    }
    
    config = course_configs.get(course_type)
    if not config:
        raise ValueError(f"Unknown course type: {course_type}")
    
    print(f"📚 Creating/getting {course_type} course...")
    
    course_data = {
        'slug': config['slug'],
        'title_vi': config['title_vi'],
        'title_en': config['title_en'],
        'description_vi': config['description_vi'],
        'is_published': True,
        'order_index': config['order_index']
    }
    
    try:
        # Try to find existing course
        response = supabase.table('courses').select('*').eq('slug', config['slug']).execute()
        if response.data:
            course = response.data[0]
            print(f"   ✅ Using existing course: {course['id']}")
            return course
        
        # Create new course
        response = supabase.table('courses').insert(course_data).execute()
        course = response.data[0]
        print(f"   ✅ Created course: {course['id']}")
        return course
    except Exception as e:
        print(f"   ❌ Error creating course: {e}")
        raise


def normalize_video_number(title, all_titles):
    """Normalize video numbers to be consistent (e.g., if one has '07', all should have leading zeros)"""
    # Check if any video in the collection uses leading zeros (like "VIDEO 07", "VIDEO 08")
    has_leading_zeros = False
    for other_title in all_titles:
        # Check for patterns like "VIDEO 07", "VIDEO 08", "Part 01", etc. (with leading zero)
        if re.search(r'(?:video|part|lesson)[\s_-]+0[1-9]\d*', other_title, re.IGNORECASE):
            has_leading_zeros = True
            break
    
    # Extract video number from title (handles both "VIDEO 8" and "VIDEO 07")
    # Match pattern: (text before)(VIDEO/Part/Lesson)(space/dash)(number)(rest of title)
    video_match = re.search(r'(.+?)((?:video|part|lesson))[\s_-]+0*(\d+)(.*)', title, re.IGNORECASE)
    if video_match:
        before_text = video_match.group(1)  # Everything before "VIDEO"
        keyword = video_match.group(2)  # "VIDEO", "Part", "Lesson" (preserve original case)
        video_num = int(video_match.group(3))  # The number (7, 8, etc.)
        after_text = video_match.group(4)  # Everything after the number
        
        # Format number with or without leading zero based on collection pattern
        if has_leading_zeros and video_num < 10:
            formatted_num = f"{video_num:02d}"  # "07", "08", etc.
        else:
            formatted_num = str(video_num)  # "7", "8", etc.
        
        # Reconstruct title with normalized number, preserving original keyword case
        return f"{before_text}{keyword} {formatted_num}{after_text}"
    
    return title


def insert_modules_and_lessons_from_collection(course_id, videos, course_type, collection_name, is_first_collection=False):
    """Insert a module for the collection and all lessons into Supabase
    Each collection creates its own module with the collection name
    Takes videos directly (not organized into modules by title)
    """
    if not collection_name:
        print(f"   ❌ Collection name is required for insert_modules_and_lessons_from_collection")
        return
    
    print(f"💾 Inserting {course_type} lessons from collection '{collection_name}' into database...")
    
    if not videos:
        print(f"   ⚠️  No videos to insert for {course_type}")
        return
    
    print(f"   📊 Total videos to insert: {len(videos)}")
    
    # Get all titles for normalization check
    all_titles = [v.get('slug', v.get('title', '')) for v in videos]
    
    # Use collection name as module name
    module_name = collection_name
    
    # Get the next order_index for this course (count existing modules)
    try:
        existing_modules = supabase.table('modules').select('order_index').eq('course_id', course_id).execute()
        max_order = 0
        if existing_modules.data:
            for mod in existing_modules.data:
                if mod.get('order_index', 0) > max_order:
                    max_order = mod.get('order_index', 0)
        next_order_index = max_order + 1
    except Exception as e:
        print(f"   ⚠️  Error getting module order: {e}, defaulting to 1")
        next_order_index = 1
    
    # Create or get module for this collection
    module_data = {
        'course_id': course_id,
        'title_vi': module_name,
        'title_en': module_name,
        'order_index': next_order_index
    }
    
    try:
        # Try to find existing module with same name and course
        existing = supabase.table('modules').select('*').eq('course_id', course_id).eq('title_vi', module_name).execute()
        if existing.data and len(existing.data) > 0:
            module = existing.data[0]
            module_id = module['id']
            print(f"   ✅ Using existing module '{module_name}': {module_id}")
        else:
            # Create new module
            response = supabase.table('modules').insert(module_data).execute()
            if not response.data or len(response.data) == 0:
                print(f"   ❌ Failed to create module '{module_name}'")
                return
            module = response.data[0]
            module_id = module['id']
            print(f"   ✅ Created module '{module_name}': {module_id}")
    except Exception as e:
        print(f"   ❌ Error creating module '{module_name}': {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Check if this is the first lesson of the entire course (across all modules)
    # We need to check if there are any existing lessons in this course
    try:
        existing_lessons = supabase.table('lessons').select('id').eq('module_id', module_id).execute()
        has_existing_lessons = existing_lessons.data and len(existing_lessons.data) > 0
        
        # Also check other modules in this course
        other_modules = supabase.table('modules').select('id').eq('course_id', course_id).neq('id', module_id).execute()
        if other_modules.data:
            for other_mod in other_modules.data:
                other_lessons = supabase.table('lessons').select('id').eq('module_id', other_mod['id']).limit(1).execute()
                if other_lessons.data and len(other_lessons.data) > 0:
                    has_existing_lessons = True
                    break
        
        is_first_lesson_of_course = is_first_collection and not has_existing_lessons
    except Exception as e:
        print(f"   ⚠️  Error checking existing lessons: {e}, assuming first lesson")
        is_first_lesson_of_course = is_first_collection
    
    # Prepare all lessons to insert
    lessons_to_insert = []
    print(f"   📝 Preparing {len(videos)} lessons for module '{module_name}'...")
    for idx, video in enumerate(videos, start=1):
        # Mark first lesson of the entire course as preview (only if this is the first collection and first lesson)
        is_preview = is_first_lesson_of_course and (idx == 1)
        
        # Get the original video title/slug (don't prepend course type)
        original_title = video.get('slug', video.get('title', 'Untitled Lesson'))
        
        # Normalize video number formatting for consistency
        normalized_title = normalize_video_number(original_title, all_titles)
        
        lesson_data = {
            'module_id': module_id,
            'title_vi': normalized_title,
            'title_en': normalized_title,
            'bunny_video_id': video['video_id'],
            'bunny_library_id': BUNNY_LIBRARY_ID,
            'duration_seconds': video.get('duration_seconds', 0),
            'is_preview': is_preview,
            'order_index': idx
        }
        lessons_to_insert.append(lesson_data)
    
    # Insert all lessons
    lessons_inserted = 0
    skipped_existing = 0
    for idx, lesson_data in enumerate(lessons_to_insert, start=1):
        try:
            # Check if lesson already exists in THIS module
            existing = supabase.table('lessons').select('*').eq('module_id', module_id).eq('bunny_video_id', lesson_data['bunny_video_id']).execute()
            if existing.data and len(existing.data) > 0:
                skipped_existing += 1
                if idx <= 3 or idx == len(lessons_to_insert):  # Only log first 3 and last to avoid spam
                    print(f"      ⏭️  Lesson {idx} already exists in this module: {lesson_data['title_vi'][:50]}")
            else:
                response = supabase.table('lessons').insert(lesson_data).execute()
                if response.data and len(response.data) > 0:
                    preview_tag = " [PREVIEW]" if lesson_data['is_preview'] else ""
                    if idx <= 5 or idx == len(lessons_to_insert):  # Only log first 5 and last to avoid spam
                        print(f"      ✅ Created lesson {idx}{preview_tag}: {lesson_data['title_vi'][:50]}")
                    lessons_inserted += 1
                else:
                    print(f"      ⚠️  No data returned for lesson {idx}: {lesson_data['title_vi'][:50]}")
                    print(f"         Response: {response}")
        except Exception as e:
            print(f"      ❌ Error creating lesson {idx} ({lesson_data['title_vi'][:50]}): {e}")
            import traceback
            traceback.print_exc()
    
    print(f"   ✅ Finished inserting into module '{module_name}': {lessons_inserted} new lessons, {skipped_existing} already existed (total processed: {len(videos)})\n")


def insert_modules_and_lessons(course_id, modules_dict, course_type, collection_name=None, is_first_collection=False):
    """Insert a module for the collection and all lessons into Supabase
    Each collection creates its own module with the collection name
    Legacy function for non-collection-based imports
    """
    if collection_name:
        print(f"💾 Inserting {course_type} lessons from collection '{collection_name}' into database...")
    else:
        print(f"💾 Inserting {course_type} lessons into database...")
    
    # Collect all videos from all modules into a single list
    all_videos = []
    for mod_num in sorted(modules_dict.keys()):
        videos = modules_dict[mod_num]
        if videos:
            all_videos.extend(videos)
    
    if not all_videos:
        print(f"   ⚠️  No videos to insert for {course_type}")
        return
    
    print(f"   📊 Total videos to insert: {len(all_videos)}")
    
    # Use collection name as module name, or default to "Lessons"
    module_name = collection_name if collection_name else 'Lessons'
    
    # Get the next order_index for this course (count existing modules)
    try:
        existing_modules = supabase.table('modules').select('order_index').eq('course_id', course_id).execute()
        max_order = 0
        if existing_modules.data:
            for mod in existing_modules.data:
                if mod.get('order_index', 0) > max_order:
                    max_order = mod.get('order_index', 0)
        next_order_index = max_order + 1
    except Exception as e:
        print(f"   ⚠️  Error getting module order: {e}, defaulting to 1")
        next_order_index = 1
    
    # Create or get module for this collection
    module_data = {
        'course_id': course_id,
        'title_vi': module_name,
        'title_en': module_name,
        'order_index': next_order_index
    }
    
    try:
        # Try to find existing module with same name and course
        existing = supabase.table('modules').select('*').eq('course_id', course_id).eq('title_vi', module_name).execute()
        if existing.data and len(existing.data) > 0:
            module = existing.data[0]
            module_id = module['id']
            print(f"   ✅ Using existing module '{module_name}': {module_id}")
        else:
            # Create new module
            response = supabase.table('modules').insert(module_data).execute()
            if not response.data or len(response.data) == 0:
                print(f"   ❌ Failed to create module '{module_name}'")
                return
            module = response.data[0]
            module_id = module['id']
            print(f"   ✅ Created module '{module_name}': {module_id}")
    except Exception as e:
        print(f"   ❌ Error creating module '{module_name}': {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Check if this is the first lesson of the entire course (across all modules)
    # We need to check if there are any existing lessons in this course
    try:
        existing_lessons = supabase.table('lessons').select('id').eq('module_id', module_id).execute()
        has_existing_lessons = existing_lessons.data and len(existing_lessons.data) > 0
        
        # Also check other modules in this course
        other_modules = supabase.table('modules').select('id').eq('course_id', course_id).neq('id', module_id).execute()
        if other_modules.data:
            for other_mod in other_modules.data:
                other_lessons = supabase.table('lessons').select('id').eq('module_id', other_mod['id']).limit(1).execute()
                if other_lessons.data and len(other_lessons.data) > 0:
                    has_existing_lessons = True
                    break
        
        is_first_lesson_of_course = is_first_collection and not has_existing_lessons
    except Exception as e:
        print(f"   ⚠️  Error checking existing lessons: {e}, assuming first lesson")
        is_first_lesson_of_course = is_first_collection
    
    # Prepare all lessons to insert
    lessons_to_insert = []
    for idx, video in enumerate(all_videos, start=1):
        # Mark first lesson of the entire course as preview (only if this is the first collection and first lesson)
        is_preview = is_first_lesson_of_course and (idx == 1)
        
        # Get the original video title/slug
        original_title = video.get('slug', video.get('title', 'Untitled Lesson'))
        
        # Prepend course type to the title: "Mill - {Name of lesson}"
        prefixed_title = f"{course_type} - {original_title}"
        
        lesson_data = {
            'module_id': module_id,
            'title_vi': prefixed_title,
            'title_en': prefixed_title,
            'bunny_video_id': video['video_id'],
            'bunny_library_id': BUNNY_LIBRARY_ID,
            'duration_seconds': video.get('duration_seconds', 0),
            'is_preview': is_preview,
            'order_index': idx
        }
        lessons_to_insert.append(lesson_data)
    
    # Insert all lessons
    lessons_inserted = 0
    for idx, lesson_data in enumerate(lessons_to_insert, start=1):
        try:
            # Check if lesson already exists
            existing = supabase.table('lessons').select('*').eq('module_id', module_id).eq('bunny_video_id', lesson_data['bunny_video_id']).execute()
            if existing.data and len(existing.data) > 0:
                print(f"      ⏭️  Lesson {idx} already exists: {lesson_data['title_vi'][:50]}")
            else:
                response = supabase.table('lessons').insert(lesson_data).execute()
                if response.data and len(response.data) > 0:
                    preview_tag = " [PREVIEW]" if lesson_data['is_preview'] else ""
                    print(f"      ✅ Created lesson {idx}{preview_tag}: {lesson_data['title_vi'][:50]}")
                    lessons_inserted += 1
                else:
                    print(f"      ⚠️  No data returned for lesson {idx}: {lesson_data['title_vi'][:50]}")
                    print(f"         Response: {response}")
        except Exception as e:
            print(f"      ❌ Error creating lesson {idx} ({lesson_data['title_vi'][:50]}): {e}")
            import traceback
            traceback.print_exc()
    
    print(f"   ✅ Finished inserting {course_type} from '{module_name}': {lessons_inserted} new lessons (total: {len(all_videos)})\n")


def get_course_type_from_collection(collection_name, collection_id=None):
    """Map collection name or ID to course type (ID takes precedence)"""
    # First, check by collection ID (takes precedence)
    if collection_id:
        collection_id_lower = collection_id.lower().strip()
        if collection_id_lower in COLLECTION_ID_TO_COURSE_TYPE:
            return COLLECTION_ID_TO_COURSE_TYPE[collection_id_lower]
    
    # Then, check by collection name
    if not collection_name:
        return None
    
    collection_lower = collection_name.lower().strip()
    
    # Direct match
    if collection_lower in COLLECTION_TO_COURSE_TYPE:
        return COLLECTION_TO_COURSE_TYPE[collection_lower]
    
    # Partial match (check if collection name contains any key)
    for key, course_type in COLLECTION_TO_COURSE_TYPE.items():
        if key in collection_lower or collection_lower in key:
            return course_type
    
    return None


def main():
    """Main function to run the import"""
    print("=" * 60)
    print("🚀 Starting video import process")
    print("=" * 60 + "\n")
    
    # Check environment variables
    if not all([BUNNY_API_KEY, BUNNY_LIBRARY_ID, SUPABASE_URL, SUPABASE_KEY]):
        print("❌ Missing required environment variables!")
        print("   Required: BUNNY_API_KEY, BUNNY_LIBRARY_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
        return
    
    try:
        # Step 1: Fetch collections from Bunny.net
        collections = fetch_collections()
        
        # If we couldn't fetch collections but have COLLECTIONS_TO_PROCESS IDs, create mock collection objects
        if not collections and COLLECTIONS_TO_PROCESS:
            print("⚠️  Could not fetch collections from API, but collection IDs are specified.")
            print("   Creating collection objects from provided IDs...")
            collections = []
            for collection_id in COLLECTIONS_TO_PROCESS:
                collections.append({
                    'id': collection_id,
                    'name': f'Collection {collection_id[:8]}...'  # Use first 8 chars as name
                })
                print(f"   Created collection object: ID={collection_id}")
            print(f"✅ Created {len(collections)} collection object(s) from provided IDs\n")
        elif collections:
            print(f"📋 Found {len(collections)} collection(s) from API:")
            for coll in collections:
                # Bunny.net uses 'guid' for collection ID, not 'id'
                coll_id = coll.get('guid') or coll.get('id', 'No ID')
                print(f"   - {coll.get('name', 'Unnamed')} (ID: {coll_id})")
            print()
        
        if collections:
            print("📦 Processing videos by collection...\n")
            
            # Track which course types we've seen and which collection was first for each
            course_type_first_collection = {}
            
            # Filter collections if COLLECTIONS_TO_PROCESS is specified
            total_collections = len(collections)
            if COLLECTIONS_TO_PROCESS:
                print(f"🔍 Filtering to only process {len(COLLECTIONS_TO_PROCESS)} specified collection(s)...")
                print(f"   Looking for IDs: {COLLECTIONS_TO_PROCESS}")
                filtered_collections = []
                for collection in collections:
                    # Bunny.net uses 'guid' for collection ID, not 'id'
                    collection_id = collection.get('guid') or collection.get('id')
                    if collection_id:
                        collection_id = str(collection_id)
                    else:
                        collection_id = ''
                    collection_name = collection.get('name', '')
                    
                    # Debug: show what we're comparing
                    print(f"   Checking collection: name='{collection_name}', guid='{collection.get('guid')}', id='{collection.get('id')}'")
                    
                    # Check if this collection should be processed (by name or ID)
                    should_process = False
                    for target in COLLECTIONS_TO_PROCESS:
                        target_str = str(target).lower().strip()
                        collection_id_lower = collection_id.lower().strip()
                        collection_name_lower = collection_name.lower().strip()
                        
                        if (target_str == collection_name_lower or 
                            target_str == collection_id_lower or
                            target_str in collection_name_lower or
                            target_str in collection_id_lower):
                            should_process = True
                            print(f"      ✅ Match found! target='{target_str}' matches collection_id='{collection_id_lower}' or name='{collection_name_lower}'")
                            break
                    
                    if should_process:
                        filtered_collections.append(collection)
                        print(f"   ✅ Will process: {collection_name} (ID: {collection_id})")
                    else:
                        print(f"   ⏭️  Skipping: {collection_name} (ID: {collection_id})")
                
                collections = filtered_collections
                print(f"\n📋 Processing {len(collections)} collection(s) out of {total_collections} total\n")
            
            # Fetch all videos once to use as cache if collection filtering doesn't work
            print("📥 Fetching all videos for collection filtering (to avoid duplicates)...")
            all_videos_cache = fetch_all_bunny_videos()
            print(f"   📊 Total videos in library: {len(all_videos_cache)}\n")
            
            # Process each collection
            for collection in collections:
                # Bunny.net uses 'guid' for collection ID, not 'id'
                collection_id = collection.get('guid') or collection.get('id')
                collection_name = collection.get('name', '')
                
                print(f"\n{'='*60}")
                print(f"📁 Processing collection: {collection_name} (ID: {collection_id})")
                print(f"{'='*60}\n")
                
                # Get course type from collection ID or name (ID takes precedence)
                course_type = get_course_type_from_collection(collection_name, collection_id)
                
                # If we couldn't determine course type from ID or name,
                # try to determine it from the first few videos in the collection
                if not course_type:
                    print(f"⚠️  Collection name '{collection_name}' (ID: {collection_id}) doesn't match any course type.")
                    print(f"   Trying to determine course type from collection name patterns...")
                    
                    # Check collection name for common patterns before falling back to video detection
                    collection_name_lower = collection_name.lower() if collection_name else ''
                    if any(keyword in collection_name_lower for keyword in ['5-axis', '5 axis', '5axis', 'multi-axis', 'multi axis', 'multiaxis']):
                        course_type = 'Multi-Axis'
                        print(f"   ✅ Detected 'Multi-Axis' from collection name pattern\n")
                    elif any(keyword in collection_name_lower for keyword in ['lathe', 'turning']):
                        course_type = 'Lathe'
                        print(f"   ✅ Detected 'Lathe' from collection name pattern\n")
                    elif any(keyword in collection_name_lower for keyword in ['3d', '3-d']):
                        course_type = 'Mill 3D'
                        print(f"   ✅ Detected 'Mill 3D' from collection name pattern\n")
                    elif any(keyword in collection_name_lower for keyword in ['mill']):
                        course_type = 'Mill'
                        print(f"   ✅ Detected 'Mill' from collection name pattern\n")
                    else:
                        # Fallback: try to determine from first video's title
                        print(f"   Trying to determine course type from videos in collection...")
                        temp_videos = fetch_videos_by_collection(collection_id, collection_name, all_videos_cache)
                        if temp_videos and len(temp_videos) > 0:
                            # Use the first video's detected course type
                            manual_mappings = load_manual_mappings()
                            first_video_parsed = parse_video_info(temp_videos[0], manual_mappings)
                            course_type = first_video_parsed.get('course_type', 'Mill')
                            print(f"   ✅ Determined course type from videos: {course_type}\n")
                        else:
                            print(f"   ⚠️  No videos found to determine course type.")
                            print(f"   Available course types: {', '.join(set(COLLECTION_TO_COURSE_TYPE.values()))}")
                            print(f"   Skipping this collection. Update COLLECTION_ID_TO_COURSE_TYPE or COLLECTION_TO_COURSE_TYPE mapping if needed.\n")
                            continue
                else:
                    print(f"✅ Mapped to course type: {course_type}\n")
                
                # Fetch videos from this collection (with cache for fallback)
                # This will ONLY get videos from this specific collection, avoiding duplicates
                print(f"🔍 Fetching videos for collection ID: {collection_id}")
                videos = fetch_videos_by_collection(collection_id, collection_name, all_videos_cache)
                
                if not videos:
                    print(f"⚠️  No videos found in collection '{collection_name}' (ID: {collection_id})")
                    print(f"   This could mean:")
                    print(f"   1. The collection is empty")
                    print(f"   2. Videos don't have collectionId field set")
                    print(f"   3. The collectionId doesn't match")
                    print(f"   Skipping this collection.\n")
                    continue
                
                print(f"✅ Successfully fetched {len(videos)} videos from collection '{collection_name}'\n")
                
                # Track if this is the first collection for this course type
                is_first_collection = course_type not in course_type_first_collection
                if is_first_collection:
                    course_type_first_collection[course_type] = collection_name
                
                # Verify videos are from this collection
                print(f"🔍 Verifying videos belong to collection '{collection_name}' (ID: {collection_id})...")
                verified_videos = []
                for video in videos:
                    video_collection_id = video.get('collectionId') or video.get('collection_id')
                    if str(video_collection_id) == str(collection_id):
                        verified_videos.append(video)
                    else:
                        print(f"   ⚠️  Video '{video.get('title', 'Unknown')}' has collectionId={video_collection_id}, expected {collection_id}")
                
                if len(verified_videos) != len(videos):
                    print(f"   ⚠️  Only {len(verified_videos)}/{len(videos)} videos match collection ID")
                
                print(f"✅ Verified {len(verified_videos)} videos from collection '{collection_name}'\n")
                
                # Parse videos to extract video_id, slug, etc.
                # This converts Bunny.net format (guid) to our format (video_id)
                print(f"📝 Parsing {len(verified_videos)} videos...")
                manual_mappings = load_manual_mappings()
                parsed_videos = []
                for video in verified_videos:
                    parsed = parse_video_info(video, manual_mappings)
                    # Override course_type with the one determined from collection name
                    parsed['course_type'] = course_type
                    parsed_videos.append(parsed)
                
                # Sort videos numerically by extracting numbers from titles
                def extract_sort_number(video):
                    """Extract numeric value from video title for sorting"""
                    title = video.get('slug', video.get('title', ''))
                    # Try to find numbers in the title (e.g., "Part 01", "Part 1", "01", "1", etc.)
                    import re
                    # Look for patterns like "Part 01", "Part 1", "01", "1", "Lesson 1", etc.
                    numbers = re.findall(r'\d+', title)
                    if numbers:
                        # Use the first number found, or combine all numbers
                        return int(numbers[0])
                    # If no number found, return a large number to put it at the end
                    return 999999
                
                parsed_videos.sort(key=extract_sort_number)
                print(f"✅ Parsed and sorted {len(parsed_videos)} videos in numerical order\n")
                
                # Create or get course
                course = create_or_get_course(course_type)
                
                # For collection-based processing, create ONE module per collection
                # Put all videos from this collection directly into that module
                # Don't use organize_videos which creates multiple modules by title
                print(f"📦 Inserting {len(parsed_videos)} videos into module '{collection_name}' for course '{course_type}'...\n")
                insert_modules_and_lessons_from_collection(
                    course['id'], 
                    parsed_videos,  # Pass parsed videos, not raw Bunny.net videos
                    course_type,
                    collection_name=collection_name,
                    is_first_collection=is_first_collection
                )
        else:
            # Fallback: Fetch all videos and organize by title (legacy behavior)
            print("⚠️  No collections found. Falling back to fetching all videos...\n")
            
            videos = fetch_all_bunny_videos()
            
            if not videos:
                print("❌ No videos found. Exiting.")
                return
            
            # Step 2: Organize videos by course type
            organized_by_course = organize_videos(videos)
            
            if not organized_by_course:
                print("❌ No videos could be organized. Check video naming patterns.")
                return
            
            # Step 3: Create courses and insert modules/lessons for each
            for course_type, course_data in organized_by_course.items():
                # Create or get course
                course = create_or_get_course(course_type)
                
                # Insert modules and lessons
                insert_modules_and_lessons(course['id'], course_data['modules'], course_type)
        
        print("=" * 60)
        print("🎉 Import completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()