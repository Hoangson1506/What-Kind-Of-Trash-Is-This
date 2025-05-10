export default {
    header: {
        title: 'Đây là rác gì?'
    },
    upload: {
        title: 'Nhận diện rác thải',
        dropzone: {
            dragActive: 'Thả tệp vào đây',
            dragInactive: 'Kéo và thả {{type}} vào đây',
            clickToSelect: 'hoặc nhấp để chọn tệp',
            supportedFormats: {
                image: 'Định dạng hỗ trợ: JPG, PNG, GIF (tối đa 10MB)',
                video: 'Định dạng hỗ trợ: MP4, WebM, MOV (tối đa 100MB)'
            }
        },
        types: {
            image: 'Hình ảnh',
            video: 'Video',
            webcam: 'Webcam'
        },
        howItWorks: {
            title: 'Cách hoạt động',
            steps: {
                upload: {
                    title: 'Tải lên',
                    description: 'Tải lên hình ảnh, video hoặc sử dụng webcam để chụp rác thải'
                },
                process: {
                    title: 'Xử lý',
                    description: 'Mô hình AI của chúng tôi phân tích để xác định loại rác thải'
                },
                results: {
                    title: 'Kết quả',
                    description: 'Nhận kết quả hiển thị loại rác và hướng dẫn xử lý phù hợp'
                }
            }
        }
    },
    results: {
        title: 'Kết quả nhận diện',
        back: 'Quay lại',
        originalImage: 'Hình ảnh gốc',
        detectionResult: 'Kết quả nhận diện',
        processing: 'Đang xử lý hình ảnh...',
        detecting: 'Đang nhận diện loại rác...',
        summary: {
            title: 'Tổng kết nhận diện',
            confidence: 'Độ chính xác: {{value}}%'
        },
        feedback: {
            title: 'Phản hồi',
            correct: 'Chính xác',
            incorrect: 'Không chính xác',
            comment: 'Điều gì không chính xác về kết quả nhận diện? (tùy chọn)',
            improveLabeling: 'Giúp cải thiện bằng cách gắn nhãn',
            submit: 'Gửi phản hồi',
            thanks: 'Cảm ơn phản hồi của bạn!'
        }
    },
    map: {
        title: 'Điểm thu gom rác gần đây',
        getDirections: 'Chỉ đường',
        acceptedMaterials: 'Vật liệu được chấp nhận:',
        userLocation: 'Vị trí của bạn'
    },
    history: {
        title: 'Lịch sử nhận diện',
        empty: {
            title: 'Chưa có nhận diện nào',
            description: 'Tải lên hình ảnh để bắt đầu'
        }
    },
    footer: {
        description: 'Giúp bạn nhận diện và xử lý rác thải đúng cách thông qua công nghệ nhận dạng hình ảnh AI.',
        quickLinks: {
            title: 'Liên kết nhanh',
            home: 'Trang chủ',
            howItWorks: 'Cách hoạt động',
            about: 'Giới thiệu',
            privacy: 'Chính sách bảo mật'
        },
        connect: {
            title: 'Kết nối với chúng tôi'
        },
        copyright: '© {{year}} Hệ thống nhận diện rác thải. Đã đăng ký bản quyền.',
        poweredBy: 'Được hỗ trợ bởi công nghệ AI tiên tiến'
    },
    label: {
        title: 'Gắn Nhãn Rác',
        saveLabel: 'Lưu Nhãn',
        undo: 'Hoàn Tác',
        clear: 'Xóa Tất Cả',
        currentLabels: 'Nhãn Hiện Tại:',
        noLabels: 'Chưa có nhãn nào.',
        instructions: {
            title: 'Hướng Dẫn:',
            step1: 'Chọn loại rác từ danh sách thả xuống',
            step2: 'Nhấp và kéo trên hình ảnh để vẽ khung giới hạn',
            step3: 'Thả chuột để xác nhận nhãn',
            step4: 'Sử dụng Hoàn Tác hoặc Xóa Tất Cả để sửa lỗi',
            step5: 'Nhấp "Lưu Nhãn" khi hoàn tất'
        }
    },
    trashes: {
        food: {
            name: 'Thực phẩm',
            description: 'Rác thực phẩm và thức ăn thừa, bao gồm vụn thức ăn, vỏ rau củ và thức ăn chưa sử dụng',
            disposalGuide: {
                instructions: 'Tách rác thực phẩm khỏi bao bì không phân hủy được như nhựa hoặc giấy để tránh nhiễm bẩn. Giữ riêng rác thực phẩm khỏi chất thải tái chế hoặc rác thông thường để hỗ trợ hệ thống ủ phân hoặc thu gom rác thực phẩm. Nếu có thể, ủ phân các mảnh vụn thực phẩm như vỏ rau củ, lõi trái cây và bã cà phê trong thùng ủ phân tại nhà hoặc thông qua chương trình địa phương. Đặt rác thực phẩm vào thùng chứa riêng, sử dụng túi phân hủy sinh học nếu được yêu cầu bởi dịch vụ quản lý chất thải địa phương.'
            }
        },
        glass: {
            name: 'Thủy tinh',
            description: 'Chai, lọ và hộp đựng bằng thủy tinh, như chai rượu, lọ thủy tinh và hộp đựng thực phẩm',
            disposalGuide: {
                instructions: 'Rửa sạch các vật dụng thủy tinh để loại bỏ cặn thức ăn hoặc chất lỏng, đảm bảo chúng có thể tái chế. Tháo nắp kim loại hoặc nhựa, vì chúng thường được tái chế riêng hoặc vứt bỏ. Nếu chương trình địa phương yêu cầu, phân loại thủy tinh theo màu (trong suốt, xanh lá, nâu) để đơn giản hóa quá trình xử lý. Đặt thủy tinh đã làm sạch vào thùng tái chế thủy tinh riêng hoặc tuân theo hướng dẫn thu gom tại lề đường.'
            }
        },
        metal: {
            name: 'Kim loại',
            description: 'Các vật dụng kim loại bao gồm lon, giấy bạc và kim loại phế liệu như lon thiếc, lon phun sương và khay giấy bạc',
            disposalGuide: {
                instructions: 'Làm sạch và rửa lon kim loại để loại bỏ cặn thức ăn hoặc chất lỏng, tránh nhiễm bẩn. Gỡ nhãn giấy hoặc nhựa khi có thể, vì chúng có thể cần được tái chế hoặc xử lý riêng. Nghiền nát lon nhôm hoặc thiếc để tiết kiệm không gian và dễ thu gom. Đặt các vật dụng kim loại đã chuẩn bị vào thùng tái chế kim loại riêng hoặc theo lịch thu gom tái chế tại lề đường.'
            }
        },
        paper: {
            name: 'Giấy',
            description: 'Các sản phẩm giấy bao gồm báo, bìa cứng và giấy văn phòng như hộp ngũ cốc, giấy in và hộp bìa cứng',
            disposalGuide: {
                instructions: 'Tái chế giấy sạch và khô trong thùng tái chế giấy. Tránh tái chế giấy bẩn hoặc dính thức ăn. Gỡ cửa sổ nhựa khỏi phong bì và làm phẳng hộp bìa cứng để tiết kiệm không gian. Nếu có thể, sử dụng máy hủy giấy cho các tài liệu nhạy cảm trước khi tái chế. Đặt các vật dụng giấy đã chuẩn bị vào thùng tái chế giấy riêng hoặc theo lịch thu gom tái chế tại lề đường.'
            }
        },
        plastic: {
            name: 'Nhựa',
            description: 'Hộp đựng, chai và vật liệu đóng gói bằng nhựa như chai nước, hộp đựng thực phẩm và túi nhựa',
            disposalGuide: {
                instructions: 'R KL rửa sạch các hộp đựng và tái chế trong thùng tái chế nhựa riêng. Tháo nắp và nhãn nếu được yêu cầu. Tránh tái chế túi nhựa trong thùng tại lề đường; sử dụng các điểm thu gom riêng. Nếu có thể, chọn các giải pháp thay thế có thể tái sử dụng để giảm rác nhựa. Đặt các vật dụng nhựa đã làm sạch vào thùng tái chế nhựa riêng hoặc theo lịch thu gom tái chế tại lề đường.'
            }
        },
        other: {
            name: 'Khác',
            description: 'Các vật dụng linh tinh không thuộc các danh mục khác, như dây cao su, đồ chơi hỏng và bao bì không thể tái chế',
            disposalGuide: {
                instructions: 'Vứt vào thùng rác thông thường. Kiểm tra hướng dẫn địa phương cho các vật dụng cụ thể. Tránh đặt các vật không thể tái chế vào thùng tái chế để tránh nhiễm bẩn. Nếu có thể, quyên góp hoặc tái sử dụng các vật dụng trước khi vứt bỏ. Đặt các vật dụng linh tinh vào thùng rác riêng hoặc tuân theo hướng dẫn quản lý chất thải địa phương.'
            }
        }
    }
};