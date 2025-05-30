import base64
from datetime import datetime, timedelta, timezone
import re
import time
import json
import os
import threading

import pymysql.cursors
from flask import jsonify, redirect, render_template, url_for, request

from app import app, mysql
from pprint import pprint


pms_DictCursor = pymysql.cursors.DictCursor
philippines_timezone = timezone(timedelta(hours=8))  # UTC+8

##### ================[[ HANDLER FUNCTIONS ]]================ #####
"""See README for more information! - Migo"""

## === USERS ===
def get_users():
    """DESC: Fetches all user accounts from the database."""
    conn, cursor = None, None
    
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `user_accounts`")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_users_responders():
    """DESC: Fetches all user accounts from the database."""
    conn, cursor = None, None
    
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `user_accounts` WHERE UA_user_role = 'responder'")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_one_user(request):
    """DESC: Fetches one user by UA_user_id."""
    data = request.json
    UA_user_id = data.get("UA_user_id")

    if not UA_user_id:
        return jsonify({"error": "Missing UA_user_id"}), 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM user_accounts WHERE UA_user_id = %s", (UA_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def add_user(request):
    """DESC: Adds a new user to the system."""
    data = request.json
    username = data.get("UA_username")
    password = data.get("UA_password")
    role = data.get("UA_user_role")
    created = data.get("UA_created_at")

    if not all([username, password, role, created]):
        return jsonify({"error": "All fields are required"}), 400
    
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("""
            INSERT INTO `user_accounts`
            (UA_username, UA_password, UA_user_role, UA_created_at)
            VALUES (%s, %s, %s, %s)
        """, (username, password, role, created))
        conn.commit()
        return jsonify({"message": "User added", "user_id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def update_user(request):
    """DESC: Updates all fields of an existing user based on request data."""
    data = request.json
    UA_user_id = data.get("UA_user_id")

    if not UA_user_id:
        return jsonify({"error": "Missing UA_user_id"}), 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `user_accounts` WHERE UA_user_id = %s", (UA_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": f"User with ID {UA_user_id} not found"}), 404

        fields = [
            "UA_username", "UA_password", "UA_user_role", "UA_created_at",
            "UA_last_name", "UA_first_name", "UA_middle_name", "UA_suffix",
            "UA_email_address", "UA_phone_number", "UA_reputation_score",
            "UA_id_picture_front", "UA_id_picture_back"
        ]
        values = [data.get(field) for field in fields]
        update_query = f"""
            UPDATE `user_accounts` SET
            {', '.join(f'{field} = %s' for field in fields)}
            WHERE UA_user_id = %s
        """
        cursor.execute(update_query, (*values, UA_user_id))
        conn.commit()
        return jsonify({"message": f"User {UA_user_id} updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def patch_user(request):
    """DESC: Partially updates user details based on the provided fields."""
    data = request.json
    UA_user_id = data.get("UA_user_id")
    
    if not UA_user_id:
        return jsonify({"error": "Missing UA_user_id"}), 400
    
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)

        cursor.execute("SELECT * FROM `user_accounts` WHERE UA_user_id = %s", (UA_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": f"User with ID {UA_user_id} not found"}), 404

        update_fields = []
        update_values = []
        
        if 'UA_username' in data:
            update_fields.append("UA_username = %s")
            update_values.append(data['UA_username'])
        if 'UA_password' in data:
            update_fields.append("UA_password = %s")
            update_values.append(data['UA_password'])
        if 'UA_user_role' in data:
            update_fields.append("UA_user_role = %s")
            update_values.append(data['UA_user_role'])
        if 'UA_created_at' in data:
            update_fields.append("UA_created_at = %s")
            update_values.append(data['UA_created_at'])
        if 'UA_last_name' in data:
            update_fields.append("UA_last_name = %s")
            update_values.append(data['UA_last_name'])
        if 'UA_first_name' in data:
            update_fields.append("UA_first_name = %s")
            update_values.append(data['UA_first_name'])
        if 'UA_middle_name' in data:
            update_fields.append("UA_middle_name = %s")
            update_values.append(data['UA_middle_name'])
        if 'UA_suffix' in data:
            update_fields.append("UA_suffix = %s")
            update_values.append(data['UA_suffix'])
        if 'UA_email_address' in data:
            update_fields.append("UA_email_address = %s")
            update_values.append(data['UA_email_address'])
        if 'UA_phone_number' in data:
            update_fields.append("UA_phone_number = %s")
            update_values.append(data['UA_phone_number'])
        if 'UA_reputation_score' in data:
            update_fields.append("UA_reputation_score = %s")
            update_values.append(data['UA_reputation_score'])
        if 'UA_id_picture_front' in data:
            update_fields.append("UA_id_picture_front = %s")
            update_values.append(data['UA_id_picture_front'])
        if 'UA_id_picture_back' in data:
            update_fields.append("UA_id_picture_back = %s")
            update_values.append(data['UA_id_picture_back'])
        
        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400

        update_query = f"""
            UPDATE `user_accounts`
            SET {', '.join(update_fields)}
            WHERE UA_user_id = %s
        """
        update_values.append(UA_user_id) 
        cursor.execute(update_query, tuple(update_values))
        conn.commit()

        return jsonify({"message": f"User {UA_user_id} updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def delete_user(request):
    """DESC: Deletes a user by UA_user_id."""
    data = request.json
    UA_user_id = data.get("UA_user_id")

    if not UA_user_id:
        return jsonify({"error": "Missing UA_user_id"}), 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)

        cursor.execute("SELECT * FROM `user_accounts` WHERE UA_user_id = %s", (UA_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": f"User with ID {UA_user_id} not found"}), 404

        cursor.execute("DELETE FROM `user_accounts` WHERE UA_user_id = %s", (UA_user_id,))
        conn.commit()

        return jsonify({"message": f"User {UA_user_id} deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

## === POSTVERIFIED REPORTS ===
def get_postverified_reports():
    """DESC: Fetches all postverified reports from the database."""
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `postverified_reports`")
        reports = cursor.fetchall()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_one_postverified_report(request):
    pass

def add_postverified_report(request):
    pass

def update_postverified_report(request):
    pass

def patch_postverified_report(request):
    pass

def delete_postverified_report(request):
    pass

## === PREVERIFIED REPORTS ===
def get_preverified_reports():
    """DESC: Fetches all preverified reports from the database."""
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `preverified_reports`")
        reports = cursor.fetchall()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_preverified_reports_by_session(data):
    """DESC: Fetches all preverified reports from the database."""
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)

        UA_user_id = data.get("UA_user_id")

        cursor.execute("SELECT * FROM `preverified_reports` WHERE PR_user_id = %s", (UA_user_id,))
        reports = cursor.fetchall()

        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_one_preverified_report(request):
    """DESC: Fetches a single preverified report by PR_report_id."""
    data = request.json
    PR_report_id = data.get("PR_report_id")

    if not PR_report_id:
        return jsonify({"error": "Missing PR_report_id"}), 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM preverified_reports WHERE PR_report_id = %s", (PR_report_id,))
        report = cursor.fetchone()
        if not report:
            return jsonify({"error": "Report not found"}), 404
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def add_preverified_report(request):
    """DESC: Adds a new preverified report to the database."""
    data = request
    user_id = data.get("PR_user_id")
    image = data.get("PR_image")
    video = data.get("PR_video")
    latitude = data.get("PR_latitude")
    longitude = data.get("PR_longitude")
    address = data.get("PR_address")
    timestamp = data.get("PR_timestamp")
    verified = data.get("PR_verified")
    report_status = data.get("PR_report_status")

    if not (image or video):
        return {"error": "At least one media file (image or video) is required"}, 400

    if any(x is None for x in [user_id, latitude, longitude, address, timestamp, verified, report_status]):
        return {"error": "Missing required fields"}, 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("""
            INSERT INTO `preverified_reports`
            (PR_user_id, PR_image, PR_video, PR_latitude, PR_longitude, PR_address, PR_timestamp, PR_verified, PR_report_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, image, video, latitude, longitude, address, timestamp, verified, report_status))
        conn.commit()
        return {"message": "Report added", "report_id": cursor.lastrowid}, 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def update_preverified_report(request):
    pass

def patch_preverified_report(request):
    pass

def delete_preverified_report(request):
    pass

### === RESPONSE LOGS ===
def get_response_logs():
    pass

def get_one_response_log(request):
    pass

def add_response_log(request):
    pass

def update_response_log(request):
    pass

def patch_response_log(request):
    pass

def delete_response_log(request):
    pass

### === FIRE STATISTICS ===
def get_fire_statistics():
    pass

def get_one_fire_statistic(request):
    pass

def add_fire_statistic(request):
    pass

def update_fire_statistic(request):
    """DESC: Updates all fields of an existing fire statistic based on FS_statistic_id."""
    data = request.json
    FS_statistic_id = data.get("FS_statistic_id")

    if not FS_statistic_id:
        return jsonify({"error": "Missing FS_statistic_id"}), 400

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)
        cursor.execute("SELECT * FROM `fire_statistics` WHERE FS_statistic_id = %s", (FS_statistic_id,))
        stat = cursor.fetchone()
        if not stat:
            return jsonify({"error": f"Fire statistic with ID {FS_statistic_id} not found"}), 404

        fields = ["FS_last_update", "FS_total_fires", "FS_false_alarms", "FS_detected_fires", "FS_average_confidence"]
        values = [data.get(field) for field in fields]
        update_query = f"""
            UPDATE `fire_statistics` SET
            {', '.join(f'{field} = %s' for field in fields)}
            WHERE FS_statistic_id = %s
        """
        cursor.execute(update_query, (*values, FS_statistic_id))
        conn.commit()
        return jsonify({"message": f"Fire statistic {FS_statistic_id} updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def patch_fire_statistic(request):
    pass

def delete_fire_statistic(request):
    pass

### === MEDIA STORAGE ===
def get_all_media_files():
    pass

def get_media_file(request):
    pass

def add_media_file(request):
    """Handles raw media file uploads (video or image) into MySQL."""
    conn = None
    cursor = None

    try:
        video_file = request.files.get("video")
        image_file = request.files.get("image")
        
        if not video_file and not image_file:
            raise ValueError("No media file uploaded (expected video or image)")
        
        media_type = 'video' if video_file else 'image'
        media_file = video_file if video_file else image_file
        
        report_data = request.form.get("report")
        if not report_data:
            raise ValueError("No report data provided")
            
        report = json.loads(report_data)
        user_id = report['reporter']['id']
        
        current_date = datetime.now().strftime("%Y%m%d") 
        current_time = datetime.now().strftime("%H%M%S")
        extension = 'mp4' if media_type == 'video' else 'jpg'
        file_name = f"ID{user_id}TIME{current_time}DATE{current_date}{media_type.upper()}.{extension}"

        file_data_bytes = media_file.read()

        conn = mysql.connect()
        cursor = conn.cursor(pms_DictCursor)

        cursor.execute("SET SESSION wait_timeout = 600")
        cursor.execute("SET SESSION interactive_timeout = 600")
        cursor.execute("SET SESSION net_read_timeout = 300")
        cursor.execute("SET SESSION net_write_timeout = 300")

        cursor.execute("""
            INSERT INTO media_storage 
            (MS_user_owner, MS_file_type, MS_file_name, MS_file_data)
            VALUES (%s, %s, %s, %s)
        """, (
            user_id, 
            media_file.content_type, 
            file_name, 
            file_data_bytes
        ))

        conn.commit()

        media_id = cursor.lastrowid

        return {
            "message": f"{media_type.capitalize()} upload successful",
            "media_id": media_id,
            "media_type": media_type,
            "file_size": len(file_data_bytes),
            "file_name": file_name
        }, 201

    except json.JSONDecodeError as e:
        return {"error": f"Invalid report data: {str(e)}"}, 400
    except Exception as e:
        if conn:
            conn.rollback()
        print(str(e))
        return {"error": str(e)}, 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def update_media_file(request):
    pass 

def delete_media_file(request):
    pass

### === UPLOAD/DOWNLOAD ===
def process_report_request(request):
    """Processes incoming report data and validates required fields with media-type specific requirements."""
    # print("\n=== STARTING REPORT REQUEST PROCESSING ===")

    # print("Checking for request data...")
    if not request.files and not request.form:
        # print("ERROR: No data provided in request")
        return None, {"error": "No data provided"}, 400

    # print("Extracting report data from request...")
    report_data = request.form.get("report")
    if not report_data:
        # print("ERROR: Missing report data in form")
        return None, {"error": "Missing report data"}, 400
    # print(f"Report data: {report_data}")

    # print("Parsing JSON report data...")
    try:
        report = json.loads(report_data)
    except json.JSONDecodeError as e:
        # print(f"JSON PARSE ERROR: {str(e)}")
        return None, {"error": f"Invalid JSON data: {str(e)}"}, 400

    # print("Checking for media files...")
    video_file = request.files.get("video")
    image_file = request.files.get("image")
    # print(f"Video File: {video_file is not None}")
    # print(f"Image File: {image_file is not None}")

    if video_file and image_file:
        # print("ERROR: Both video and image provided")
        return None, {"error": "Cannot provide both video and image"}, 400

    if video_file:
        report['media_type'] = 'video'
        report['file_received'] = True
        # print("Video file detected")
    elif image_file:
        report['media_type'] = 'image'
        report['file_received'] = True
        # print("Image file detected")
    else:
        # print("ERROR: No media file provided")
        return None, {"error": "No media file provided (video or image required)"}, 400

    # print("Validating required fields...")
    required_fields = {
        'reporter': ['id'],
        'location': ['coordinates', 'address'],
        'media': ['size']
    }

    if report['media_type'] == 'video':
        required_fields['media'].append('duration')

    for section, fields in required_fields.items():
        if section not in report:
            # print(f"MISSING SECTION: {section}")
            return None, {"error": f"Missing section: {section}"}, 400
        for field in fields:
            if field not in report[section]:
                # print(f"MISSING FIELD: {section}.{field}")
                return None, {"error": f"Missing field: {section}.{field}"}, 400

    # print(f"=== {report['media_type'].upper()} REPORT VALIDATION SUCCESSFUL ===")
    return report, {"message": f"{report['media_type'].capitalize()} report validated successfully"}, 200

def prepare_report_blob(request):
    """Processes the request and prepares data for BLOB storage"""
    try:
        # Validate request contains data
        if not request.files and not request.form:
            return None, {"error": "No data provided"}, 400
        
        # Extract and parse report JSON
        report_data = request.form.get("report")
        if not report_data:
            return None, {"error": "Missing report data"}, 400
        
        report = json.loads(report_data)
        
        # Handle video data (either from file or base64)
        video_blob = None
        video_file = request.files.get("video")
        
        if video_file:
            video_blob = video_file.read()  
        elif 'media' in report and 'data' in report['media']:
            video_blob = base64.b64decode(report['media']['data'])
        
        report_package = {
            'metadata': {
                'reporter': report.get('reporter', {}),
                'location': report.get('location', {}),
                'timestamp': report.get('timestamp'),
            },
            'media': {
                'type': report.get('media', {}).get('type'),
                'size': report.get('media', {}).get('size'),
                'duration': report.get('media', {}).get('duration'),
                'data': video_blob  
            }
        }
        
        # Serialize to JSON string (with binary as base64)
        blob_data = json.dumps(report_package, default=str)
        return blob_data, {"message": "Report processed"}, 200
        
    except Exception as e:
        return None, {"error": f"Processing failed: {str(e)}"}, 500

def log_report_details(report):
    """Logs report details with media-type awareness"""
    print("\n=== RECEIVED REPORT ===")
    print(f"Media Type: {report.get('media_type', 'unknown')}")
    print(f"Reporter ID: {report['reporter']['id']}")
    print(f"Coordinates: {report['location']['coordinates']['latitude']}, {report['location']['coordinates']['longitude']}")
    print(f"Address: {report['location']['address']}")
    print(f"File Size: {report['media']['size']} bytes")
    
    if report.get('media_type') == 'video':
        print(f"Duration: {report['media']['duration']} seconds")
    
    print(f"File Received: {'Yes' if report.get('file_received') else 'No'}")
    print("======================\n")



##### ===================[[ ROUTES ]]=================== #####

## === DEFAULT ROUTE ===
@app.route('/', methods=["GET"])
def route_default():
    pass

@app.route('/ping', methods=["GET"])
def route_ping():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return jsonify({"message": "Pong!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

## === AUTHENTICATION ===
def handle_login(data):

    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor()

        UA_username = data.get("UA_username")
        UA_password = data.get("UA_password")

        if not UA_username or not UA_password:
            return {"error": "Missing username or password"}, 400

        cursor.execute("SELECT * FROM `user_accounts` WHERE UA_username = %s", (UA_username,))
        found_user = cursor.fetchone()

        if not found_user:
            return {"error": f"User '{UA_username}' is not a registered user within the app!"}, 404

        UA_user_id = found_user[0] if found_user[0] is not None else None
        UA_username = found_user[1] if found_user[1] is not None else None
        UA_passwordStored = found_user[2] if found_user[2] is not None else None
        UA_user_role = found_user[3] if found_user[3] is not None else None
        UA_created_at = found_user[4] if found_user[4] is not None else None
        UA_last_name = found_user[5] if found_user[5] is not None else None
        UA_first_name = found_user[6] if found_user[6] is not None else None
        UA_middle_name = found_user[7] if found_user[7] is not None else None
        UA_suffix = found_user[8] if found_user[8] is not None else None
        UA_email_address = found_user[9] if found_user[9] is not None else None
        UA_phone_number = found_user[10] if found_user[10] is not None else None
        UA_reputation_score = found_user[11] if found_user[11] is not None else 0  
        UA_id_picture_front = found_user[12] if found_user[12] is not None else None
        UA_id_picture_back = found_user[13] if found_user[13] is not None else None

        print(UA_password, UA_passwordStored)
        if UA_password != UA_passwordStored:
            return {"error": "The password submitted is invalid!"}, 401

        user_data = {
            "UA_user_id": UA_user_id,
            "UA_username": UA_username,
            "UA_password": "Secret!",
            "UA_user_role": UA_user_role,
            "UA_created_at": UA_created_at,
            "UA_last_name": UA_last_name,
            "UA_first_name": UA_first_name,
            "UA_middle_name": UA_middle_name,
            "UA_suffix": UA_suffix,
            "UA_email_address": UA_email_address,
            "UA_phone_number": UA_phone_number,
            "UA_reputation_score": UA_reputation_score,
            "UA_id_picture_front": UA_id_picture_front,
            "UA_id_picture_back": UA_id_picture_back
        }

        return {
            "message": "Login is successful!",
            "user_data": user_data
        }, 200

    except Exception as e:
        print("Error found! " + str(e))
        return {"error": str(e)}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def handle_registration(data):
    conn, cursor = None, None
    try:
        conn = mysql.connect()
        cursor = conn.cursor()

        UA_username = data.get("UA_username")
        UA_password = data.get("UA_password")
        UA_email_address = data.get("UA_email_address")

        if not all([UA_username, UA_password, UA_email_address]):
            return jsonify({"error": "All fields are required. Please make sure nothing is left blank."}), 400

        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, UA_email_address):
            return jsonify({"error": "Oops! That doesn’t look like a valid email address."}), 400

        cursor.execute("SELECT 1 FROM user_accounts WHERE UA_username = %s", (UA_username,))
        if cursor.fetchone():
            return jsonify({"error": f"The username '@{UA_username}' is already in use. Try another one?"}), 409

        cursor.execute("SELECT 1 FROM user_accounts WHERE UA_email_address = %s", (UA_email_address,))
        if cursor.fetchone():
            return jsonify({"error": "That email address is already linked to an existing account."}), 409

        cursor.execute("""
            INSERT INTO user_accounts (
                UA_username, UA_password, UA_user_role, UA_created_at, UA_last_name, 
                UA_first_name, UA_middle_name, UA_suffix, UA_email_address, 
                UA_phone_number, UA_reputation_score
            )
            VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s, %s)
        """, (
            UA_username, 
            UA_password, 
            "civilian", 
            None, None, None, None, 
            UA_email_address, 
            None, 0
        ))

        conn.commit()

        return jsonify({"message": f"Welcome aboard, @{UA_username}! Your account has been successfully created."}), 201

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}. Please contact support or try again later."}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

## === AUTHENTICATION RESOURCE ===

@app.route('/auth/login', methods=["POST"])
def route_login_attempt():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405

    try:
        return handle_login(request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/register', methods=["POST"])
def route_registration_attempt():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405

    try:
        return handle_registration(request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

## === USER RESOURCE ===

@app.route('/user/get/all', methods=['GET'])
def route_get_users():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return get_users()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/get/all/responders', methods=['GET'])
def route_get_users_responders():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return get_users_responders()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/get/one', methods=['GET'])
def route_get_one_user():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return get_one_user(request)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/add', methods=['POST'])
def route_add_user():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405
    
    try:
        return add_user(request=request)
    except KeyError as e:
        return jsonify({"error": f"Missing required data: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/update', methods=['POST'])
def route_update_user():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405
    
    try:
        return update_user(request=request)
    except KeyError as e:
        return jsonify({"error": f"Missing required data: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/user/patch', methods=["PUT"])
def route_patch_user():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405
    
    try:
        return patch_user(request=request)
    except KeyError as e:
        return jsonify({"error": f"Missing required data: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/delete', methods=['DELETE'])
def route_delete_user():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405
    
    try:
        return delete_user(request=request)
    except KeyError as e:
        return jsonify({"error": f"Missing required data: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

## === REPORTS RESOURCE ===
@app.route('/reports/upload/video', methods=["POST"])
def route_upload_report_video():
    try:
        # Process and validate request
        report, response, status = process_report_request(request)
        if not report:
            return jsonify(response), status

        # Upload media file
        media_response, media_status = add_media_file(request)
        if media_status != 201:
            return jsonify(media_response), media_status

        # Create report record
        report_data = {
            "PR_user_id": report['reporter']['id'],
            "PR_image": None,
            "PR_video": media_response['media_id'],
            "PR_latitude": report['location']['coordinates']['latitude'],
            "PR_longitude": report['location']['coordinates']['longitude'],
            "PR_address": report['location']['address'],
            "PR_timestamp": datetime.now(philippines_timezone).strftime("%Y-%m-%d %H:%M:%S"),
            "PR_verified": False,
            "PR_report_status": "pending"
        }
        
        report_response, report_status = add_preverified_report(report_data)
        if report_status != 201:
            return jsonify(report_response), report_status

        # Success response
        return jsonify({
            "status": "success",
            "message": "Video report processed successfully",
            "report_id": report_response.get('report_id'),
            "media_id": media_response['media_id'],
            "reporter_id": report['reporter']['id'],
            "timestamp": report_data['PR_timestamp']
        }), 200

    except Exception as e:
        print(f"Error processing video report: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to process video report",
            "error": str(e)
        }), 500
    
@app.route('/reports/upload/image', methods=["POST"])
def route_upload_report_image():
    try:
        report, response, status = process_report_request(request)
        if not report:
            return jsonify(response), status

        media_response, media_status = add_media_file(request)
        if media_status != 201:
            return jsonify(media_response), media_status

        report_data = {
            "PR_user_id": report['reporter']['id'],
            "PR_image": media_response['media_id'],
            "PR_video": None,
            "PR_latitude": report['location']['coordinates']['latitude'],
            "PR_longitude": report['location']['coordinates']['longitude'],
            "PR_address": report['location']['address'],
            "PR_timestamp": datetime.now(philippines_timezone).strftime("%Y-%m-%d %H:%M:%S"),
            "PR_verified": False,
            "PR_report_status": "pending"
        }
        
        report_response, report_status = add_preverified_report(report_data)
        if report_status != 201:
            return jsonify(report_response), report_status

        return jsonify({
            "status": "success",
            "message": "Image report processed successfully",
            "report_id": report_response.get('report_id'),
            "media_id": media_response['media_id'],
            "reporter_id": report['reporter']['id'],
            "timestamp": report_data['PR_timestamp']
        }), 200

    except Exception as e:
        print(f"Error processing image report: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to process image report",
            "error": str(e)
        }), 500
    
@app.route('/reports/preverified/all', methods=['GET'])
def route_get_preverified_reports():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return get_preverified_reports()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reports/preverified/session', methods=['POST'])
def route_get_session_preverified_reports():
    if request.method != 'POST':
        return jsonify({"error": "Invalid request method. Expected POST method."}), 405
    
    try:
        return get_preverified_reports_by_session(request.json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reports/postverified/all', methods=['GET'])
def route_get_postverified_reports():
    if request.method != 'GET':
        return jsonify({"error": "Invalid request method. Expected GET method."}), 405
    
    try:
        return get_postverified_reports()
    except Exception as e:
        return jsonify({"error": str(e)}), 500



### === BOILERPLATE CODE ===
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)