import json
import boto3
import csv
import io

# Initialize the S3 client
s3 = boto3.client('s3')

# Configuration
BUCKET_NAME = 'rinnah-2026-portal'
FILE_NAME = 'guests.csv'

def lambda_handler(event, context):
    try:
        # 1. Parse incoming RSVP data from the Frontend
        print(f"Received event: {json.dumps(event)}")
        body = json.loads(event.get('body', '{}'))
        guest_id = str(body.get('id'))
        heads = str(body.get('heads'))

        # 2. Download the current CSV file from S3
        response = s3.get_object(Bucket=BUCKET_NAME, Key=FILE_NAME)
        content = response['Body'].read().decode('utf-8')
        
        # 3. Read and Update the data in memory
        # DictReader uses the first row (headers) as keys
        reader = csv.DictReader(io.StringIO(content))
        rows = list(reader)
        fieldnames = reader.fieldnames
        
        updated = False
        for row in rows:
            if row['ID'] == guest_id:
                row['RSVP'] = 'Done'
                row['Heads'] = heads
                updated = True
                print(f"Updating ID {guest_id}: {heads} heads")
                break

        # 4. If we found the guest, upload the updated CSV back to S3
        if updated:
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
            
            s3.put_object(
                Bucket=BUCKET_NAME, 
                Key=FILE_NAME, 
                Body=output.getvalue(),
                ContentType='text/csv'
            )
            print("Successfully uploaded updated CSV to S3")

        # 5. Return a successful response to the Browser
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Vital for CORS
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'status': 'success', 
                'message': f'RSVP saved for ID {guest_id}'
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }