#########################################
## Created by Sathiya Shunmugasundaram
## Serverless Architectures on AWS
## http://book.acloud.guru/
## Last Updated: Feb 28, 2017
#########################################

from __future__ import print_function

import json
import urllib
import boto3
import logging
import os

print('Loading function')

s3 = boto3.client('s3')
transcoder = boto3.client('elastictranscoder')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    This is the Lambda hander function
    """
    logger.info('got event{}'.format(event))
    # Get the bucket and key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    logger.info("bucket is: %s", bucket)
    key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))
    #Replace whitespaces by +
    sourceKey = ' '.join(key.split()).replace(" ","+")
    logger.info("Formatted key is: %s", sourceKey)
    #Remove extension for output key
    outputKey = sourceKey.split(".")[0]
    logger.info("outputKey is: %s", sourceKey)
    #collect the pipeline id from Lambda environment variable
    pipeline_id = os.environ['pipeline_id']
    logger.info("pipeline_id is: %s", pipeline_id)
    try:
        job = transcoder.create_job(
                PipelineId=pipeline_id,
                Input={
                    'Key': sourceKey
                },
                Outputs=[
                    {
                        'Key': outputKey + '-1080p' + '.mp4',
                        'PresetId': '1351620000001-000001'  #Generic 1080p
                    },
                    {
                        'Key': outputKey + '-720p' + '.mp4',
                        'PresetId': '1351620000001-000010'  #Generic 720p
                    },
                    {
                        'Key': outputKey + '-web-720p' + '.mp4',
                        'PresetId': '1351620000001-100070'  #Web Friendly 720p
                    }
                ],
            )
    except Exception as e:
        print(e)
        print('Error creating Transcoder JOb')
        raise e
