import { MockDocument } from './types';

export const mockDocuments: MockDocument[] = [
  {
    id: 'ai-ethics-vi',
    title: 'Bài giảng: Kiến trúc Trí tuệ Nhân tạo & Kiểm soát Ảo giác LLM',
    description: 'Nghiên cứu về các kỹ thuật giới hạn ngữ cảnh nghiêm ngặt (Strict Context-Bounding) và quy trình kiểm định câu hỏi trong mô hình ngôn ngữ lớn.',
    fileName: 'Bai_Giang_AI_va_Kiem_Soat_Ao_Giac.pdf',
    fileSize: '1.4 MB',
    paragraphs: [
      {
        id: 'P1',
        text: 'Các Mô hình Ngôn ngữ Lớn (LLM) được huấn luyện trên tập dữ liệu văn bản khổng lồ, giúp chúng xuất sắc trong việc tạo văn bản nhưng cũng dễ dẫn đến "ảo giác kiến thức" (hallucination). Ảo giác xảy ra khi mô hình tạo ra các câu có vẻ rất hợp lý nhưng lại sai sự thật hoặc không có trong dữ liệu nguồn. Trong các lĩnh vực đòi hỏi độ chính xác cao như y tế, pháp luật hay kiểm tra giáo dục, hiện tượng này khiến LLM thông thường trở nên không đáng tin cậy nếu không có sự can thiệp nghiêm ngặt.'
      },
      {
        id: 'P2',
        text: 'Để giải quyết vấn đề này, các hệ thống hiện đại áp dụng kiến trúc "Giới hạn ngữ cảnh nghiêm ngặt" (Strict Context-Bounding). Khác với RAG thông thường (vẫn cho phép LLM tự do bổ sung câu trả lời từ trí nhớ pre-train), Strict Context-Bounding khóa chặt sự chú ý của mô hình. Hệ thống đưa ra prompt cấm truy cập tri thức bên ngoài, bắt buộc LLM chỉ được trích xuất câu hỏi và đáp án dựa hoàn toàn vào các đoạn văn bản nguồn được cung cấp.'
      },
      {
        id: 'P3',
        text: 'Quy trình xác minh ngữ cảnh được thực hiện qua hai giai đoạn: Kiểm định khởi tạo (Generation Audit) và Xử lý hậu kỳ (Post-Processing). Trong giai đoạn Kiểm định khởi tạo, nhiệt độ mô hình (temperature) được thiết lập gần 0.0 để hạn chế tối đa sự sáng tạo tự do. Ở giai đoạn Xử lý hậu kỳ, công cụ phân tích cú pháp sẽ so sánh các thực thể trong câu hỏi với mã đoạn nguồn (như [P1], [P2]), nếu phát hiện thông tin ngoài văn bản sẽ lập tức cảnh báo lỗi vỡ ngữ cảnh (OOB - Out of Bounds).'
      },
      {
        id: 'P4',
        text: 'Giá trị cốt lõi của kiến trúc này trong việc tạo đề thi tự động là rất lớn. Giảng viên có thể giảm tới 70% thời gian soạn đề mà vẫn đảm bảo 100% câu hỏi bám sát giáo trình. Học sinh khi làm bài ôn tập cũng nhận được các câu hỏi đi kèm trích dẫn đoạn văn cụ thể, giúp đối chiếu kiến thức và tra cứu nguồn tài liệu một cách minh bạch, chính xác.'
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'Hiện tượng "ảo giác kiến thức" (hallucination) trong Mô hình Ngôn ngữ Lớn (LLM) là gì?',
        options: [
          'Hiện tượng phần cứng máy tính bị quá tải khi huấn luyện mô hình',
          'Sự cố giao diện người dùng hiển thị sai định dạng phông chữ',
          'Hiện tượng mô hình tạo ra thông tin nghe có vẻ hợp lý nhưng sai sự thật hoặc không có trong dữ liệu nguồn',
          'Trạng thái mô hình xử lý ngôn ngữ nhanh hơn 70% so với bình thường'
        ],
        correctAnswer: 'Hiện tượng mô hình tạo ra thông tin nghe có vẻ hợp lý nhưng sai sự thật hoặc không có trong dữ liệu nguồn',
        citation: 'P1',
        explanation: 'Đoạn [P1] định nghĩa rõ: Ảo giác xảy ra khi mô hình tạo ra các câu có vẻ rất hợp lý nhưng lại sai sự thật hoặc không có trong dữ liệu nguồn.',
        curriculumAligned: true
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        questionText: 'Điểm khác biệt cốt lõi giữa kiến trúc Strict Context-Bounding và RAG thông thường là gì?',
        options: [
          'Strict Context-Bounding chỉ dành riêng cho các dòng chip GPU thế hệ mới',
          'Strict Context-Bounding khóa chặt sự chú ý của mô hình, cấm truy cập kiến thức bên ngoài văn bản được cung cấp',
          'RAG thông thường không cần sử dụng bất kỳ văn bản đầu vào nào',
          'Strict Context-Bounding cho phép mô hình sáng tạo nội dung tự do không giới hạn'
        ],
        correctAnswer: 'Strict Context-Bounding khóa chặt sự chú ý của mô hình, cấm truy cập kiến thức bên ngoài văn bản được cung cấp',
        citation: 'P2',
        explanation: 'Đoạn [P2] nêu rõ: Khác với RAG thông thường, Strict Context-Bounding khóa chặt sự chú ý của mô hình, cấm truy cập tri thức bên ngoài và bắt buộc chỉ tạo nội dung dựa trên đoạn văn bản nguồn.',
        curriculumAligned: true
      },
      {
        id: 'q3',
        type: 'fill-in-the-blank',
        questionText: 'Trong giai đoạn Kiểm định khởi tạo (Generation Audit), nhiệt độ mô hình (temperature) được thiết lập gần ________ để hạn chế tối đa sự sáng tạo tự do.',
        correctAnswer: '0.0',
        citation: 'P3',
        explanation: 'Đoạn [P3] chỉ rõ: Trong giai đoạn Kiểm định khởi tạo, nhiệt độ mô hình (temperature) được thiết lập gần 0.0 để hạn chế tối đa sự sáng tạo tự do.',
        curriculumAligned: true
      },
      {
        id: 'q4',
        type: 'short-answer',
        questionText: 'Quy trình xác minh giới hạn ngữ cảnh trong kiến trúc SEGS được thực hiện qua hai giai đoạn nào?',
        correctAnswer: 'Kiểm định khởi tạo (Generation Audit) và Xử lý hậu kỳ (Post-Processing)',
        citation: 'P3',
        explanation: 'Đoạn [P3] khẳng định: Quy trình xác minh ngữ cảnh được thực hiện qua hai giai đoạn: Kiểm định khởi tạo (Generation Audit) và Xử lý hậu kỳ (Post-Processing).',
        curriculumAligned: true
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        questionText: 'Hệ thống tạo đề thi SEGS giúp giảng viên giảm tối đa bao nhiêu phần trăm thời gian soạn đề bài?',
        options: [
          '35%',
          '50%',
          '70%',
          '90%'
        ],
        correctAnswer: '70%',
        citation: 'P4',
        explanation: 'Đoạn [P4] ghi nhận: Giảng viên có thể giảm tới 70% thời gian soạn đề mà vẫn đảm bảo 100% câu hỏi bám sát giáo trình.',
        curriculumAligned: true
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        questionText: 'Mô hình GPT-4o được OpenAI chính thức phát hành vào ngày tháng năm nào?',
        options: [
          'Ngày 13 tháng 05 năm 2024',
          'Ngày 14 tháng 05 năm 2024',
          'Ngày 18 tháng 04 năm 2024',
          'Ngày 20 tháng 06 năm 2024'
        ],
        correctAnswer: 'Ngày 13 tháng 05 năm 2024',
        citation: 'P1',
        explanation: 'CẢNH BÁO: Câu hỏi này chứa tri thức ngoài văn bản (Out of Bounds). Ngày phát hành GPT-4o không xuất hiện trong bài giảng nguồn.',
        outOfBounds: true,
        curriculumAligned: false
      }
    ]
  },
  {
    id: 'web-dev-nextjs',
    title: 'Giáo trình: Lập trình Web Frontend Hiện đại với React & Next.js',
    description: 'Tài liệu hướng dẫn kiến trúc Server Components, Client Components, Render tối ưu và tích hợp RESTful API.',
    fileName: 'Giao_Trinh_Lap_Trinh_Web_React_NextJS.docx',
    fileSize: '920 KB',
    paragraphs: [
      {
        id: 'P1',
        text: 'React là một thư viện JavaScript mã nguồn mở được phát triển bởi Meta nhằm xây dựng giao diện người dùng dựa trên các thành phần (Components). Điểm mạnh của React nằm ở cơ chế Virtual DOM, giúp so sánh sự thay đổi của cây giao diện và chỉ cập nhật những phần phần tử thực sự thay đổi trên trình duyệt, từ đó tối ưu hóa hiệu năng hiển thị của ứng dụng.'
      },
      {
        id: 'P2',
        text: 'Next.js là một React Framework mạnh mẽ hỗ trợ xây dựng ứng dụng Full-stack. Với kiến trúc App Router trong các phiên bản mới, Next.js phân chia thành hai loại thành phần chính: Server Components (chạy và render mã nguồn tại server, giúp giảm dung lượng JS gửi về client) và Client Components (chạy tại trình duyệt, sử dụng cho các tương tác như onClick, useState, useEffect).'
      },
      {
        id: 'P3',
        text: 'Việc kết nối giữa ứng dụng Next.js Frontend và Backend (như FastAPI hay Express) thường thông qua các RESTful API chuẩn. Frontend sử dụng các hàm fetch() hoặc thư viện Axios để gửi yêu cầu HTTP (GET, POST, PUT, DELETE) kèm theo định dạng dữ liệu JSON. Cơ chế CORS (Cross-Origin Resource Sharing) tại Backend cần được cấu hình đúng để cho phép các yêu cầu từ tên miền của Frontend.'
      },
      {
        id: 'P4',
        text: 'Để quản lý trạng thái ứng dụng (State Management) hiệu quả, phát triển ứng dụng React hiện đại khuyến khích việc giữ trạng thái cục bộ (local state) ở cấp component thấp nhất có thể. Khi dữ liệu cần chia sẻ giữa nhiều trang hoặc component cha-con phức tạp, các giải pháp như React Context API, Redux Toolkit hoặc Zustand sẽ được áp dụng để đảm bảo mã nguồn dễ bảo trì và mở rộng.'
      }
    ],
    questions: [
      {
        id: 'pq1',
        type: 'multiple-choice',
        questionText: 'Cơ chế nào giúp thư viện React tối ưu hóa hiệu năng hiển thị bằng cách chỉ cập nhật các phần tử thực sự thay đổi trên giao diện?',
        options: [
          'Direct DOM Manipulation',
          'Virtual DOM',
          'Browser Shadow Root',
          'Service Worker Caching'
        ],
        correctAnswer: 'Virtual DOM',
        citation: 'P1',
        explanation: 'Đoạn [P1] nêu rõ: Điểm mạnh của React nằm ở cơ chế Virtual DOM, giúp so sánh sự thay đổi và chỉ cập nhật những phần phần tử thực sự thay đổi.',
        curriculumAligned: true
      },
      {
        id: 'pq2',
        type: 'multiple-choice',
        questionText: 'Vai trò chính của Server Components trong kiến trúc App Router của Next.js là gì?',
        options: [
          'Xử lý trực tiếp các sự kiện click và thay đổi ô nhập dữ liệu trên trình duyệt',
          'Render mã nguồn tại Server để giảm dung lượng file JavaScript gửi về cho Client',
          'Thay thế hoàn toàn cơ sở dữ liệu ở phía Backend',
          'Tự động biên dịch mã nguồn Python thành mã nguồn JavaScript'
        ],
        correctAnswer: 'Render mã nguồn tại Server để giảm dung lượng file JavaScript gửi về cho Client',
        citation: 'P2',
        explanation: 'Đoạn [P2] khẳng định: Server Components chạy và render mã nguồn tại server, giúp giảm dung lượng JS gửi về client.',
        curriculumAligned: true
      },
      {
        id: 'pq3',
        type: 'fill-in-the-blank',
        questionText: 'Cơ chế kết nối an toàn tại Backend cho phép trình duyệt ở tên miền khác gọi API được gọi là ________ (Cross-Origin Resource Sharing).',
        correctAnswer: 'CORS',
        citation: 'P3',
        explanation: 'Đoạn [P3] ghi rõ: Cơ chế CORS (Cross-Origin Resource Sharing) tại Backend cần được cấu hình đúng để cho phép các yêu cầu từ tên miền của Frontend.',
        curriculumAligned: true
      },
      {
        id: 'pq4',
        type: 'short-answer',
        questionText: 'Kể tên hai thư viện hoặc giải pháp phổ biến được dùng để quản lý trạng thái toàn cục (State Management) trong React.',
        correctAnswer: 'React Context API, Redux Toolkit hoặc Zustand',
        citation: 'P4',
        explanation: 'Đoạn [P4] nêu ra các giải pháp: React Context API, Redux Toolkit hoặc Zustand.',
        curriculumAligned: true
      },
      {
        id: 'pq5',
        type: 'multiple-choice',
        questionText: 'Frontend sử dụng hai công cụ/thư viện nào phổ biến để gửi yêu cầu HTTP (GET, POST) tới Backend?',
        options: [
          'hàm fetch() hoặc thư viện Axios',
          'HTML Form Submit mặc định',
          'Thư viện jQuery AJAX cũ',
          'WebSockets Server'
        ],
        correctAnswer: 'hàm fetch() hoặc thư viện Axios',
        citation: 'P3',
        explanation: 'Đoạn [P3] nêu rõ: Frontend sử dụng các hàm fetch() hoặc thư viện Axios để gửi yêu cầu HTTP.',
        curriculumAligned: true
      },
      {
        id: 'pq6',
        type: 'multiple-choice',
        questionText: 'Ngôn ngữ lập trình Rust được công bố lần đầu tiên bởi tập đoàn Mozilla vào năm nào?',
        options: [
          'Năm 2010',
          'Năm 2015',
          'Năm 2008',
          'Năm 2020'
        ],
        correctAnswer: 'Năm 2010',
        citation: 'P1',
        explanation: 'CẢNH BÁO: Thông tin về ngôn ngữ Rust không có trong tài liệu Lập trình Web React & Next.js (Out of Bounds).',
        outOfBounds: true,
        curriculumAligned: false
      }
    ]
  }
];
