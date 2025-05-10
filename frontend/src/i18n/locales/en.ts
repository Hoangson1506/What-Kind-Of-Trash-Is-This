export default {
    header: {
        title: 'What kind of trash is this?'
    },
    upload: {
        title: 'Detect Your Trash',
        dropzone: {
            dragActive: 'Drop the file here',
            dragInactive: 'Drag and drop {{type}} here',
            clickToSelect: 'or click to select a file',
            supportedFormats: {
                image: 'Supported formats: JPG, PNG, GIF (max 10MB)',
                video: 'Supported formats: MP4, WebM, MOV (max 100MB)'
            }
        },
        types: {
            image: 'Image',
            video: 'Video',
            webcam: 'Webcam'
        },
        howItWorks: {
            title: 'How it works',
            steps: {
                upload: {
                    title: 'Upload',
                    description: 'Upload an image, video, or use your webcam to capture trash items'
                },
                process: {
                    title: 'Process',
                    description: 'Our AI model analyzes the content to identify the type of trash'
                },
                results: {
                    title: 'Results',
                    description: 'Get results showing trash type and proper disposal instructions'
                }
            }
        }
    },
    results: {
        title: 'Detection Results',
        back: 'Back',
        originalImage: 'Original Image',
        detectionResult: 'Detection Result',
        processing: 'Processing your image...',
        detecting: 'Detecting trash types...',
        summary: {
            title: 'Detection Summary',
            confidence: 'Confidence: {{value}}%'
        },
        feedback: {
            title: 'Feedback',
            correct: 'Correct',
            incorrect: 'Incorrect',
            comment: 'What was incorrect about the detection? (optional)',
            improveLabeling: 'Help improve by labeling',
            submit: 'Submit Feedback',
            thanks: 'Thank you for your feedback!'
        }
    },
    map: {
        title: 'Nearby Disposal Points',
        getDirections: 'Get Directions',
        acceptedMaterials: 'Accepted materials:',
        userLocation: 'Your location'
    },
    history: {
        title: 'Recent Detections',
        empty: {
            title: 'No recent detections',
            description: 'Upload an image to get started'
        }
    },
    footer: {
        description: 'Helping you identify and properly dispose of waste materials through AI-powered image recognition.',
        quickLinks: {
            title: 'Quick Links',
            home: 'Home',
            howItWorks: 'How It Works',
            about: 'About',
            privacy: 'Privacy Policy'
        },
        connect: {
            title: 'Connect With Us'
        },
        copyright: '© {{year}} Trash Detection System. All rights reserved.',
        poweredBy: 'Powered by advanced AI technology'
    },
    label: {
        title: 'Label Your Trash',
        saveLabel: 'Save Label',
        undo: 'Undo',
        clear: 'Clear All',
        currentLabels: 'Current Labels:',
        noLabels: 'No labels yet.',
        instructions: {
            title: 'Instructions:',
            step1: 'Select a trash type from the dropdown',
            step2: 'Click and drag on the image to draw a bounding box',
            step3: 'Release to confirm the label',
            step4: 'Use Undo or Clear All to correct mistakes',
            step5: 'Click "Save Labels" when finished'
        }
    },
    trashes: {
        food: {
            name: 'Food',
            description: 'Food waste and leftovers, including scraps, peels, and uneaten food',
            disposalGuide: {
                instructions: 'Separate food waste from non-compostable packaging like plastic or paper to avoid contamination. Keep it distinct from recyclables or general waste to support composting or food waste collection systems. If possible, compost food scraps such as vegetable peels, fruit cores, and coffee grounds in a backyard compost bin or through a local program. Place food waste in a designated bin, using compostable bags if required by your local waste management service.'
            }
        },
        glass: {
            name: 'Glass',
            description: 'Glass bottles, jars, and containers, such as wine bottles, mason jars, and food containers',
            disposalGuide: {
                instructions: 'Rinse glass items thoroughly to remove food residue or liquids, ensuring they are recyclable. Remove metal or plastic caps and lids, as they are often recycled separately or discarded. If required by your local program, sort glass by color (clear, green, brown) to streamline processing. Place cleaned glass in a designated glass recycling bin or follow curbside pickup guidelines.'
            }
        },
        metal: {
            name: 'Metal',
            description: 'Metal items including cans, aluminum foil, and scrap metal like tin cans, aerosol cans, and foil trays',
            disposalGuide: {
                instructions: 'Clean and rinse metal cans and containers to remove food residue or liquids, preventing contamination. Peel off paper or plastic labels when possible, as they may need separate recycling or disposal. Crush aluminum or tin cans to save space and ease collection. Place prepared metal items in a designated metal recycling bin or curbside recycling pickup.'
            }
        },
        paper: {
            name: 'Paper',
            description: 'Paper products including newspapers, cardboard, and office paper like cereal boxes, printer paper, and cardboard boxes',
            disposalGuide: {
                instructions: 'Recycle clean, dry paper in paper recycling bins. Avoid recycling soiled or food-contaminated paper. Remove plastic windows from envelopes and flatten cardboard boxes to save space. If possible, use a paper shredder for sensitive documents before recycling. Place prepared paper items in a designated paper recycling bin or curbside recycling pickup.'
            }
        },
        plastic: {
            name: 'Plastic',
            description: 'Plastic containers, bottles, and packaging materials like water bottles, food containers, and plastic bags',
            disposalGuide: {
                instructions: 'Rinse containers and recycle in designated plastic bins. Remove caps and labels if required. Avoid recycling plastic bags in curbside bins; use designated drop-off locations. If possible, choose reusable alternatives to reduce plastic waste. Place cleaned plastic items in a designated plastic recycling bin or curbside recycling pickup.'
            }
        },
        other: {
            name: 'Other',
            description: 'Miscellaneous items that do not fit into other categories, such as rubber bands, broken toys, and non-recyclable packaging',
            disposalGuide: {
                instructions: 'Dispose of in regular trash bins. Check local guidelines for specific items. Avoid placing non-recyclable items in recycling bins to prevent contamination. If possible, donate or repurpose items before disposal. Place miscellaneous items in a designated trash bin or follow local waste management guidelines.'
            }
        }
    }
};