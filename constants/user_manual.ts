
export const USER_MANUAL_TEXT = `
### HƯỚN DẪN SỬ DỤNG GAME NHẬN VAI (ROLE PLAY AI)

Nếu cần hỏi chi tiết có thể vào link sau:
https://discord.com/channels/831577653492187196/1380506833633935461

---

### **Phần 1: Cài Đặt Ban Đầu (Bắt Buộc)**

Để trò chơi hoạt động, bạn cần có một API Key từ Google Gemini.

1.  **Cách lấy API Key:**
    *   Truy cập vào trang web: **https://aistudio.google.com/app/u/0/apikey**
    *   Đăng nhập bằng tài khoản Google của bạn.
    *   Nhấn vào nút "Create API key in new project".
    https://res.cloudinary.com/dropcqgvd/image/upload/v1751469390/Screenshot_2025-07-02_221449_oyeftf.png
    *   Một API Key sẽ hiện ra, hãy nhấn vào biểu tượng copy để sao chép nó.

2.  **Cách điền API Key vào game:**
    *   Ở màn hình chính của game, chọn **Thiết Lập API Gemini**.
    https://res.cloudinary.com/dropcqgvd/image/upload/v1751473279/Screenshot_2025-07-02_231957_qzuucv.png
    *   Trong màn hình thiết lập, chọn **Sử dụng API Key Cá Nhân**.
    *   Dán API Key bạn vừa copy vào ô **Khóa API Gemini Cá Nhân**. Bạn có thể thêm nhiều key để xoay tua.
    https://res.cloudinary.com/dropcqgvd/image/upload/v1751473280/Screenshot_2025-07-02_231904_aieehq.png
    *   Nhấn **Lưu Thiết Lập**.

---

### **Phần 2: Tạo Thế Giới Mới**

Có hai cách để bắt đầu một cuộc phiêu lưu mới:

**A. Dùng AI Hỗ Trợ (Khuyến khích cho người mới):**
Đây là cách nhanh nhất để tạo ra một thế giới đầy đủ và thú vị.

*   **Tạo Từ Ý Tưởng:**
    *   Trong tab **AI Hỗ Trợ**, nhập ý tưởng cốt truyện của bạn vào ô "Mô tả ý tưởng...".
    *   Bạn có thể bật **Chế Độ Người Lớn (18+)** và tùy chỉnh các yếu tố như phong cách miêu tả, mức độ bạo lực, tông màu câu chuyện.
    *   Nhấn nút "Phân Tích & Tạo Chi Tiết Thế Giới". AI sẽ tự động tạo ra nhân vật, bối cảnh, kỹ năng, vật phẩm... dựa trên ý tưởng của bạn.

*   **Tạo Từ Đồng Nhân (Fanfiction):**
    *   Nếu bạn muốn chơi trong thế giới của một bộ truyện có sẵn (ví dụ: Phàm Nhân Tu Tiên, Tru Tiên,...), hãy chọn mục **Ý Tưởng Đồng Nhân**.
    *   Bạn có thể nhập tên truyện hoặc tải lên file .txt của truyện đó.
    *   Nhấn nút "Phân Tích & Tạo Đồng Nhân". AI sẽ đọc và tạo ra một thế giới bám sát nguyên tác.

**B. Tùy Chỉnh Thủ Công:**
Bạn có thể tự tay thiết lập mọi thứ bằng cách chuyển qua các tab: **Nhân Vật & Cốt Truyện**, **Thiết Lập Thế Giới**, **Yếu Tố Khởi Đầu**. Tại đây bạn có thể chỉnh sửa mọi thứ từ tên nhân vật, hệ thống cảnh giới, đến từng vật phẩm, kỹ năng ban đầu.

*   **Tab Yếu Tố Khởi Đầu:** Tại đây bạn có thể tinh chỉnh sâu hơn. Ví dụ, khi thêm một NPC, nếu bạn đã bật hệ thống tu luyện, bạn có thể thiết lập chi tiết "Cảnh giới", "Tư chất", **"Linh căn"**, **"Thể chất đặc biệt"**, và cả **"Tuổi thọ"** cho họ, giúp thế giới khởi đầu trở nên phong phú và có chiều sâu hơn.

*Mẹo: Bạn có thể dùng AI tạo thế giới trước, sau đó vào các tab này để tinh chỉnh lại theo ý muốn.*

---

### **Phần 3: Giao Diện Gameplay Chính**

Sau khi tạo game, bạn sẽ vào màn hình chơi chính.

*   **Khung Truyện (Chính giữa):** Đây là nơi AI kể chuyện và hiển thị các lựa chọn.
*   **Ô Nhập Liệu (Bên dưới):** Nơi bạn nhập hành động hoặc lời thoại của mình. Bạn có thể chọn loại nhập liệu là "Hành động" (nhân vật trực tiếp làm) hoặc "Câu chuyện" (bạn gợi ý cho AI diễn biến tiếp theo).
*   **Thanh Chức Năng (Trên cùng):** Chứa các nút để mở các bảng thông tin và chức năng quan trọng.

**Các nút trên thanh chức năng:**
*   **Nhân Vật:** Xem chỉ số, kỹ năng, trạng thái, túi đồ của bạn.
*   **Trang Bị:** Mở màn hình trang bị vật phẩm cho nhân vật chính.
*   **Hậu Cung:** Mở màn hình quản lý Đạo lữ và Nô lệ để tương tác.
*   **Trang Bị Hậu Cung:** Mở màn hình riêng để trang bị vật phẩm cho các thành viên hậu cung.
*   **Quản Lý Tù Nhân:** Mở màn hình quản lý các tù nhân bạn bắt được.
*   **Bản Đồ:** Xem bản đồ thế giới.
*   **Luyện Chế:** Chế tạo vật phẩm mới từ nguyên liệu.
*   **Tu Luyện:** Bế quan hoặc song tu để tăng sức mạnh (chỉ khả dụng ở khu an toàn).
*   **Thế Giới:** Xem thông tin về các NPC, địa điểm, phe phái, tri thức đã khám phá.
*   **Nhiệm Vụ:** Theo dõi các nhiệm vụ đang làm, đã hoàn thành hoặc thất bại.
*   **Hiển Thị:** Tùy chỉnh font chữ, màu sắc của giao diện.
*   **Lưu Game:** Lưu lại tiến trình hiện tại.
*   **Lùi Lượt:** Quay lại một lượt chơi trước đó (hữu ích khi AI hiểu sai hoặc bạn muốn thử lại).
*   **Thoát:** Thoát game về màn hình chính.

---

### **Phần 4: Các Chức Năng Đặc Biệt**

*   **Chiến Đấu:**
    *   Khi gặp kẻ địch, game sẽ tự động chuyển sang màn hình chiến đấu.
    *   Giao diện bao gồm thông tin đối thủ ở trên, nhật ký chiến đấu ở giữa, và bảng điều khiển của bạn ở dưới (có các tab Chỉ Số, Kỹ Năng, Vật Phẩm).
    *   Trong lượt của mình, bạn có thể chọn các hành động AI gợi ý hoặc tự nhập lệnh như 'Dùng Hỏa Cầu Thuật tấn công Goblin'.
    *   Sau khi chiến thắng hoặc kẻ địch đầu hàng, một màn hình sẽ hiện ra cho phép bạn quyết định số phận của chúng: Kết Liễu, Bắt Giữ, hoặc Thả Đi.

*   **Quản Lý Tù Nhân:**
    *   Bạn có thể bắt giữ kẻ địch sau khi chiến thắng. Họ sẽ xuất hiện trong màn hình Quản Lý Tù Nhân.
    *   Tại đây, bạn có thể tương tác với các tù nhân đã bắt được.
    *   Các hành động như tra tấn, đánh đập sẽ làm giảm **Ý Chí** và tăng **Phục Tùng**, nhưng cũng tăng **Phản Kháng** và giảm **Thiện Cảm**. Ngược lại, đối xử tốt sẽ có tác dụng ngược lại.
    *   Khi một tù nhân có **Phục Tùng** và **Thiện Cảm** đủ cao, bạn sẽ có lựa chọn để thu nhận họ vào hậu cung của mình với tư cách **Đạo Lữ** hoặc **Nô Lệ**.

*   **Quản Lý Hậu Cung & Trang Bị:**
    *   Màn hình **Hậu Cung** cho phép bạn tương tác sâu hơn với các đạo lữ và nô lệ của mình. Các hành động ở đây có thể tăng cường mối quan hệ, mở ra các cốt truyện phụ, hoặc thậm chí là cùng nhau tu luyện (song tu).
    *   Màn hình **Trang Bị Hậu Cung** là nơi bạn có thể trang bị những vật phẩm mạnh mẽ nhất cho các thành viên hậu cung, giúp họ hỗ trợ bạn tốt hơn. Cơ chế trang bị tương tự nhân vật chính.

*   **Tu Luyện:**
    *   **Tu Luyện Công Pháp:** Chọn "Bế Quan" hoặc "Song Tu" (nếu có công pháp và bạn đồng tu phù hợp). Chọn thời gian và bắt đầu để tăng kinh nghiệm.
    *   **Tu Luyện Linh Kĩ:** Chọn kỹ năng cần luyện để tăng độ thuần thục, giúp kỹ năng mạnh hơn.

*   **Bản Đồ:**
    *   Dùng chuột để kéo (pan) và lăn chuột để phóng to/thu nhỏ. Nhấn vào các địa điểm để xem chi tiết.
    *   Nút **"Tìm Kiếm"** cho phép bạn dùng AI để tìm các địa điểm mới dựa trên mô tả, giúp bạn chủ động khám phá thế giới.

*   **Luyện Chế:**
    *   Kéo các nguyên liệu vào các ô trống, điền yêu cầu của bạn, và nhấn "Luyện Chế" để AI tạo ra vật phẩm mới.

*   **Đấu Giá & Kinh Tế:**
    *   Khi đến các địa điểm như "Phường Thị", "Thương Thành", "Đấu Giá Hội", các nút tương ứng sẽ xuất hiện. Bạn có thể mua/bán đồ với NPC hoặc tham gia đấu giá kịch tính.

---

### **Phần 5: Lưu và Tải Game**

*   **Lưu Game:** Game có cơ chế tự động lưu sau mỗi vài lượt chơi. Bạn cũng có thể nhấn nút "Lưu Game" để lưu thủ công.
*   **Tải Game:** Ở màn hình chính, chọn "Tải Game" để xem danh sách các file đã lưu.
*   **Nhập/Xuất Dữ Liệu:** Chức năng này cho phép bạn xuất file lưu game của mình ra một file (.json hoặc .sav.gz) để sao lưu hoặc chia sẻ cho người khác. Ngược lại, bạn cũng có thể nhập file lưu từ người khác để chơi tiếp. Đây là cách tốt nhất để đảm bảo bạn không mất tiến trình chơi.

---

### **Phần 6: Cheat & Debug (Dành cho người chơi thích vọc vạch)**

Trò chơi có một bảng điều khiển "Debug" ẩn, cho phép bạn can thiệp trực tiếp vào game bằng các dòng lệnh (tags) giống như AI sử dụng. Điều này rất hữu ích để thử nghiệm, sửa lỗi, hoặc đơn giản là "cheat" để cuộc chơi dễ dàng hơn.

**1. Mở Bảng Debug:**
*   Trong màn hình chơi game chính, nhấn vào nút "Debug" (biểu tượng con bọ 🐞) ở góc trên bên phải.
*   Bảng điều khiển sẽ hiện ra. Bạn có thể kéo thả để di chuyển hoặc thay đổi kích thước của nó.

**2. Sử Dụng Chức Năng "Xử Lý Tags Thủ Công":**
*   Trong bảng Debug, bạn sẽ thấy mục "Xử Lý Tags Thủ Công".
*   **Ô lời kể (narration):** Bạn có thể nhập một đoạn văn bản vào đây để nó hiện ra trong nhật ký như một lời kể của AI.
*   **Ô tags:** Đây là nơi bạn nhập các dòng lệnh cheat. Mỗi lệnh phải nằm trên một dòng riêng.
*   Sau khi nhập xong, nhấn nút "Xử lý Tags".

**3. Danh Sách Các Lệnh (Tags) Hữu Ích và Ví Dụ:**

Dưới đây là một số lệnh mạnh mẽ bạn có thể sử dụng. Hãy cẩn thận vì chúng có thể làm mất cân bằng game!

**a. Thay đổi chỉ số nhân vật:**
*   **Lệnh:** \`[STATS_UPDATE: TênChỉSố=GiáTrị, ...]\`
*   **Các Chỉ Số Hợp Lệ:** \`sinhLuc\`, \`linhLuc\`, \`kinhNghiem\`, \`currency\` (tiền tệ).
*   **Cách Dùng:**
    *   Cộng/trừ: \`sinhLuc=+=100\`, \`currency=-=50\`
    *   Hồi đầy: \`sinhLuc=MAX\`, \`linhLuc=MAX\`
*   **Ví dụ:**
    *   Thêm 1000 tiền và hồi đầy sinh lực, linh lực:
        \`\`\`
        [STATS_UPDATE: currency=+1000, sinhLuc=MAX, linhLuc=MAX]
        \`\`\`
    *   Thêm 50% kinh nghiệm của cấp hiện tại:
        \`\`\`
        [STATS_UPDATE: kinhNghiem=+50%]
        \`\`\`

**b. Nhận vật phẩm:**
*   **Lệnh:** \`[ITEM_ACQUIRED: ...]\`
*   **Ví dụ:**
    *   Nhận 10 viên đan dược hồi phục xịn:
        \`\`\`
        [ITEM_ACQUIRED: name="Cửu Chuyển Hồi Hồn Đan", type="Potion Hồi Phục", potionType="Hồi Phục", description="Đan dược thượng phẩm, có thể cứu người từ cõi chết.", quantity=10, rarity="Cực Phẩm", value=500, effectsList="Hồi 5000 HP;Hồi 5000 MP"]
        \`\`\`
    *   Nhận một thanh Thần Kiếm:
        \`\`\`
        [ITEM_ACQUIRED: name="Thí Thần Kiếm", type="Equipment Vũ Khí", equipmentType="Vũ Khí", description="Thanh kiếm cổ xưa chứa đựng sức mạnh diệt thần.", quantity=1, rarity="Chí Tôn", value=999999, statBonusesJSON='{"sucTanCong": 1000, "maxSinhLuc": 5000}', uniqueEffectsList="Bỏ qua 30% phòng thủ;Gây hiệu ứng 'Thí Thần' (giảm 20% toàn bộ chỉ số của đối thủ)", slot="Vũ Khí Chính"]
        \`\`\`

**c. Học kỹ năng mới:**
*   **Lệnh:** \`[SKILL_LEARNED: ...]\`
*   **Ví dụ:**
    *   Học một công pháp Thể Tu Thần Phẩm:
        \`\`\`
        [SKILL_LEARNED: name="Bất Diệt Thần Thể", description="Công pháp luyện thể tối thượng, tôi luyện thân thể thành bất hoại.", skillType="Công Pháp Tu Luyện", congPhapType="Thể Tu", congPhapGrade="Thiên Phẩm"]
        \`\`\`
    *   Học một cấm thuật hủy diệt:
        \`\`\`
        [SKILL_LEARNED: name="Thiên Địa Đồng Quy", description="Hi sinh toàn bộ sinh mệnh để tung ra một đòn hủy diệt.", skillType="Cấm Thuật", sideEffects="Người sử dụng chắc chắn tử vong.", manaCost=0, cooldown=9999, baseDamage=999999, otherEffects="Gây sát thương chuẩn lên toàn bộ kẻ địch"]
        \`\`\`
    *   Học một kỹ năng nghề nghiệp:
        \`\`\`
        [SKILL_LEARNED: name="Thông Thạo Luyện Đan", description="Trở thành đại tông sư luyện đan.", skillType="Nghề Nghiệp", professionType="Luyện Đan Sư", skillDescription="Tăng 50% tỉ lệ thành công khi luyện đan.", professionGrade="Cửu phẩm"]
        \`\`\`

**d. Tăng độ thuần thục kỹ năng:**
*   **Lệnh:** \`[SKILL_UPDATE: name="Tên Kỹ Năng", proficiency=+=X]\`
*   **Ví dụ:** Tăng 1000 điểm thuần thục cho kỹ năng "Hỏa Cầu Thuật":
    \`\`\`
    [SKILL_UPDATE: name="Hỏa Cầu Thuật", proficiency=+=1000]
    \`\`\`

**e. Thay đổi quan hệ với NPC:**
*   **Lệnh:** \`[NPC_UPDATE: name="Tên NPC", affinity=+=X]\`
*   **Ví dụ:** Tăng 100 điểm thiện cảm với "Tiểu Long Nữ":
    \`\`\`
    [NPC_UPDATE: name="Tiểu Long Nữ", affinity=+=100]
    \`\`\`

**f. Thay đổi thời gian và tuổi thọ:**
*   **Lệnh:** \`[CHANGE_TIME: ngay=X, thang=Y, nam=Z]\`
*   **Lưu ý:** Lệnh này sẽ làm giảm tuổi thọ của tất cả các nhân vật, bao gồm cả bạn.
*   **Ví dụ:** Thời gian trôi qua 10 năm:
    \`\`\`
    [CHANGE_TIME: nam=10]
    \`\`\`

**g. Gỡ bỏ bình cảnh (bottleneck):**
*   **Lệnh:** \`[REMOVE_BINH_CANH_EFFECT: kinhNghiemGain=1]\`
*   **Cách Dùng:** Nếu nhân vật đang bị "Bình Cảnh", lệnh này sẽ giúp đột phá ngay lập tức lên cảnh giới lớn tiếp theo.
*   **Ví dụ:**
    \`\`\`
    [REMOVE_BINH_CANH_EFFECT: kinhNghiemGain=1]
    \`\`\`
**h. Xóa bỏ NPC:**
*   **Lệnh** \`[NPC_REMOVE: name="tên npc muốn xóa"]\`
---

### **Phần 7: Các Hệ Thống Phức Tạp (Thất Bại & Nô Dịch)**

Trò chơi không chỉ có chiến thắng. Thất bại, bị bắt giữ, và thay đổi thân phận là những phần quan trọng của câu chuyện, mở ra những hướng đi hoàn toàn mới.

**A. Hệ Thống Thất Bại (Khi HP về 0):**

Khi bạn gục ngã trong chiến đấu hoặc do các sự kiện khác (trúng độc, bẫy), đó không phải là "Game Over". AI sẽ tạo ra một kịch bản hậu quả hợp lý dựa trên hoàn cảnh:

*   **Bị bỏ mặc:** Bạn có thể tỉnh dậy sau đó một thời gian, bị mất một số vật phẩm và tiền bạc, và nhận một hiệu ứng xấu (debuff) như "Trọng Thương".
*   **Được cứu giúp:** Một NPC thân thiện hoặc bí ẩn có thể tìm thấy và cứu bạn. Bạn có thể tỉnh dậy ở một nơi an toàn nhưng phải trả giá bằng vật phẩm hoặc một lời hứa.
*   **Bị bắt giữ:** Đây là hậu quả nghiêm trọng nhất. Kẻ thù sẽ không giết bạn mà bắt bạn làm Tù Nhân hoặc Nô Lệ, mở ra một chương mới trong cuộc đời bạn.

**B. Hệ Thống Tù Nhân & Nô Lệ:**

Khi bị bắt, thân phận của bạn sẽ thay đổi, và một hệ thống tương tác phức tạp với "Chủ Nhân" sẽ được kích hoạt.

**1. Trạng Thái Của Người Chơi (Thân Phận Tù Nhân/Nô Lệ):**

Đây là những chỉ số cốt lõi quyết định tương tác của bạn với chủ nhân. Bạn có thể xem chúng trong bảng nhân vật.

*   **Ý Chí (Willpower):**
    *   **Ý nghĩa:** Đại diện cho sự kiên cường, tinh thần không bị khuất phục. Đây là chỉ số quan trọng nhất và khó thay đổi nhất.
    *   **Tăng khi:** Bạn có hành động thách thức, giữ vững lập trường, hoặc có một sự kiện truyền cảm hứng.
    *   **Giảm khi:** Bị tra tấn tâm lý/thể xác tàn nhẫn, bị hạ nhục liên tục, mất đi hy vọng.
    *   **Khi về 0:** Bạn hoàn toàn suy sụp, trở thành một cái vỏ rỗng chỉ biết tuân lệnh máy móc. Các lựa chọn hành động của người chơi sẽ bị hạn chế nghiêm trọng.
    *   **Khi đạt 100:** Bạn có một ý chí sắt đá, mở khóa các lựa chọn thách thức hoặc thao túng ngược lại chủ nhân.

*   **Phản Kháng (Resistance):**
    *   **Ý nghĩa:** Mức độ thù địch và hành động chống đối ra mặt.
    *   **Tăng khi:** Bị đối xử tàn bạo, bị ép buộc.
    *   **Giảm khi:** Được đối xử tốt, khi Ý Chí giảm, hoặc khi Phục Tùng tăng.
    *   **Khi đạt 100:** Kích hoạt sự kiện "Nổi Loạn", một nỗ lực tấn công hoặc đào tẩu đầy rủi ro.

*   **Phục Tùng (Obedience):**
    *   **Ý nghĩa:** Mức độ vâng lời thể hiện ra bên ngoài.
    *   **Tăng khi:** Bị trừng phạt hiệu quả, được ban thưởng khi vâng lời.
    *   **Giảm khi:** Hành động chống đối thành công, hoặc khi Phản Kháng quá cao.
    *   **Khi đạt 100:** Chủ nhân có thể tin tưởng và giao cho bạn các nhiệm vụ bên ngoài, tạo ra cơ hội VÀNG để bỏ trốn hoặc lật kèo.

*   **Sợ Hãi (Fear) & Tin Tưởng (Trust):**
    *   **Ý nghĩa:** Hai chỉ số đối lập, thể hiện cảm xúc của bạn đối với chủ nhân.
    *   **Sợ hãi cao** có thể tạm thời tăng Phục Tùng nhưng sẽ bào mòn Ý Chí nhanh hơn.
    *   **Tin tưởng cao** mở khóa các lựa chọn hợp tác thật lòng, có thể phát triển thành tình cảm, và là một con đường để thay đổi số phận.

**2. Trạng Thái và Hành Vi Của Chủ Nhân (Master):**

Chủ nhân không phải là một nhân vật tĩnh. Họ có tâm trạng, nhu cầu, và mục tiêu riêng. AI sẽ điều khiển họ **chủ động** tương tác với bạn dựa trên các thuộc tính sau (bạn có thể xem chúng trong bảng nhân vật của mình):

*   **Tâm Trạng (Mood):** \`Vui Vẻ, Hài Lòng, Bình Thường, Bực Bội, Giận Dữ, Nghi Ngờ\`. Tâm trạng ảnh hưởng đến cách chủ nhân đối xử với bạn. Khi họ vui, họ có thể ban thưởng. Khi họ giận, họ có thể trừng phạt.
*   **Sủng Ái (Favor):** Thể hiện mức độ yêu thích của chủ nhân dành cho bạn. Sủng ái cao có thể mang lại lợi ích, đãi ngộ tốt hơn.
*   **Nhu Cầu (Needs):** Đây là yếu tố cốt lõi thúc đẩy hành động của chủ nhân.
    *   **Dục Vọng (Desire):** Khi cao, chủ nhân sẽ chủ động tìm đến bạn để thỏa mãn nhu cầu tình dục (nếu 18+ bật).
    *   **Tham Vọng (Ambition):** Khi cao, chủ nhân có thể bắt bạn tham gia vào một kế hoạch nguy hiểm.
    *   **An Toàn (Safety):** Khi cao, chủ nhân có thể trở nên đa nghi, tra hỏi bạn.
    *   **Giải Trí (Entertainment):** Khi cao, chủ nhân có thể bắt bạn làm trò mua vui.
*   **Mục Tiêu Hiện Tại:** Mục tiêu dài hạn của chủ nhân. Các hành động của họ sẽ xoay quanh mục tiêu này.

**3. Cách Tương Tác và Các Lệnh (Tags) Điều Khiển:**

Mỗi hành động của bạn sẽ được AI diễn giải và gây ra hậu quả. AI sẽ sử dụng các tag để cập nhật lại trạng thái của bạn và chủ nhân. Bạn cũng có thể dùng các tag này trong Bảng Debug để "cheat".

*   **Cập nhật trạng thái của bạn:**
    *   **Lệnh:** \`[PLAYER_SPECIAL_STATUS_UPDATE: willpower=+=X, resistance=-=Y, ...]\`
    *   **Ví dụ:** Sau một hành động nghe lời, AI có thể trả về tag \`[PLAYER_SPECIAL_STATUS_UPDATE: obedience=+=10, resistance=-=5]\`.

*   **Cập nhật trạng thái của chủ nhân:**
    *   **Lệnh:** \`[MASTER_UPDATE: mood='Vui Vẻ', currentGoal='...', favor=+=X, affinity=+=X, needs.Dục Vọng=-=Y, ...]\`
    *   **Ví dụ:** Nếu bạn làm chủ nhân hài lòng, AI có thể trả về \`[MASTER_UPDATE: mood='Hài Lòng', favor=+=5]\`. Nếu bạn thỏa mãn nhu cầu dục vọng của họ, có thể là \`[MASTER_UPDATE: needs.Dục Vọng=-=40, favor=+=10]\`.

*   **Trở lại tự do:**
    *   **Lệnh:** \`[BECOMEFREE]\`
    *   **Cách dùng:** Khi bạn trốn thoát thành công hoặc được trả tự do, AI sẽ sử dụng tag này. Bạn cũng có thể tự "cheat" bằng tag này để thoát khỏi thân phận hiện tại ngay lập tức.

**4. Thoát Khỏi Thân Phận:**

Cuộc sống của một tù nhân hoặc nô lệ là một cuộc đấu trí và đấu tranh sinh tồn.

*   **Cách Tương Tác:** Mỗi hành động bạn chọn ("Làm việc chăm chỉ", "Im lặng chịu đựng", "Lén lút tìm đường trốn", "Quyến rũ lính canh"...) sẽ ảnh hưởng đến các chỉ số trên. Hãy lựa chọn khôn ngoan.
*   **Các Con Đường Thoát Khỏi:**
    *   **Đào Tẩu:** Lựa chọn các hành động lén lút, tìm kiếm cơ hội. Rủi ro rất cao nhưng phần thưởng là tự do.
    *   **Nổi Loạn:** Đẩy chỉ số Phản Kháng lên 100 và chuẩn bị cho một cuộc chiến một mất một còn.
    *   **Được Giải Cứu:** Nếu bạn có đồng minh bên ngoài, họ có thể tìm cách cứu bạn.
    *   **Được Chủ Nhân Trả Tự Do:** Bằng cách tăng Phục Tùng và Tin Tưởng đến mức tối đa, hoặc khiến chủ nhân cảm thấy bạn là một gánh nặng.
    *   **Trở Thành Hậu Cung (Áp dụng cho NPC tù nhân):** Khi bạn là chủ nhân và một tù nhân có Thiện Cảm, Phục Tùng đủ cao, bạn có thể thu nhận họ.
    *   **Cảm Hóa Chủ Nhân:** Bằng cách tăng Tin Tưởng và Sủng Ái, bạn có thể thay đổi mối quan hệ và có được một kết cục bất ngờ.

**5. Lưu ý về 18+:**
*   Nếu chế độ 18+ được bật, các tương tác với chủ nhân có thể bao gồm các yếu tố tình dục.
*   Các hành động như "hầu hạ", "làm ấm giường" có thể ảnh hưởng lớn đến các chỉ số thân phận và nhu cầu của chủ nhân, theo đúng Tông Màu và Phong Cách đã chọn.

---

### **Phần 8: Tùy Chỉnh Nâng Cao - Chủng Tộc & Cảnh Giới**

Một trong những tính năng mạnh mẽ nhất của game là khả năng tùy chỉnh sâu hệ thống tu luyện, tạo ra một thế giới độc nhất cho riêng bạn.

**1. Hiểu Về Hệ Thống Chủng Tộc và Cảnh Giới**

*   **Mỗi Chủng Tộc, Một Con Đường:** Game không giới hạn bạn ở một hệ thống tu luyện duy nhất. Bạn có thể định nghĩa các con đường tu luyện hoàn toàn khác nhau cho từng chủng tộc. Ví dụ:
    *   **Nhân Tộc:** Tu luyện theo con đường kinh điển (Luyện Khí -> Trúc Cơ -> Kim Đan...).
    *   **Ma Tộc:** Tu luyện theo ma công, sử dụng ma khí (Ma Binh -> Ma Tướng -> Ma Vương...).
    *   **Yêu Tộc:** Tu luyện dựa trên huyết mạch, khai mở sức mạnh cổ xưa (Yêu Binh -> Yêu Tướng -> Yêu Vương...).
    *   **Sáng Tạo Vô Hạn:** Bạn có thể tự tạo ra Cổ Tộc, Thần Tộc, Long Tộc... với hệ thống cấp bậc của riêng họ.

*   **Yêu Thú Riêng Biệt:** Các loài quái vật, yêu thú không có linh trí (khác với Yêu Tộc có thể hóa hình người) cũng có một hệ thống cảnh giới riêng, giúp phân định sức mạnh của chúng trong tự nhiên.

**2. Cách Tùy Chỉnh**

Tất cả các tùy chỉnh này được thực hiện trong màn hình **"Cuộc Phiêu Lưu Mới"**, tại tab **"Thiết Lập Thế Giới"**.

*   **Bật Hệ Thống:** Đảm bảo bạn đã tick vào ô **"Bật Hệ Thống Tu Luyện"**. Nếu không, tất cả nhân vật sẽ là người thường.

*   **Hệ Thống Cảnh Giới Theo Chủng Tộc:**
    *   Đây là một danh sách. Mỗi mục trong danh sách đại diện cho một chủng tộc.
    *   **Tên Chủng Tộc:** Nhập tên chủng tộc bạn muốn định nghĩa (ví dụ: "Nhân Tộc", "Tiên Tộc"). Tên này phải trùng với chủng tộc bạn đặt cho nhân vật chính hoặc NPC để hệ thống áp dụng đúng.
    *   **Hệ Thống Cảnh Giới:** Nhập các cảnh giới lớn, phân cách nhau bằng dấu \` - \`. Ví dụ: \`Phàm Nhân - Luyện Khí - Trúc Cơ\`.
    *   **Thêm/Xóa:** Bạn có thể nhấn nút **"+ Thêm Hệ Thống"** để tạo một con đường tu luyện cho một chủng tộc mới, hoặc nhấn nút **"X"** để xóa một hệ thống không mong muốn.

*   **Hệ Thống Cảnh Giới Yêu Thú:**
    *   Đây là một ô văn bản riêng. Nhập hệ thống cấp bậc cho các loài quái vật tại đây, cũng phân cách bằng dấu \` - \`.

*   **Cảnh Giới Khởi Đầu:**
    *   Sau khi định nghĩa các hệ thống trên, bạn cần chỉ định cảnh giới bắt đầu cho nhân vật chính. Tên cảnh giới ở đây PHẢI là một cảnh giới lớn có trong hệ thống bạn đã tạo, theo sau là một tiểu cảnh giới (ví dụ: "Luyện Khí Nhất Trọng").

**3. Mẹo & Gợi Ý:**

*   **Nhất Quán:** Để game cân bằng hơn, số lượng cảnh giới lớn nên tương đương nhau giữa các chủng tộc. Ví dụ, nếu Nhân Tộc có 10 cảnh giới lớn, Ma Tộc và Yêu Tộc cũng nên có khoảng 10 cảnh giới.
*   **Bắt Đầu Từ AI:** Cách dễ nhất là dùng chức năng **"AI Hỗ Trợ"** để tạo ra một thế giới ban đầu. AI sẽ tự động tạo ra các hệ thống cảnh giới rất hợp lý và sáng tạo. Sau đó, bạn có thể vào tab "Thiết Lập Thế Giới" để xem, chỉnh sửa, hoặc thêm bớt theo ý mình.
*   **Tên gọi:** Hãy đặt tên cảnh giới một cách rõ ràng và logic. Điều này sẽ giúp AI hiểu và tạo ra các diễn biến, NPC, vật phẩm phù hợp hơn với thế giới của bạn.

---

### **Phần 9: Tìm Hiểu Về Kinh Tế & Giá Trị Vật Phẩm**

Thế giới trong game có một hệ thống kinh tế động, nơi giá trị của mỗi vật phẩm không phải là ngẫu nhiên mà được tính toán dựa trên sức mạnh và độ hiếm của nó. Hiểu rõ điều này sẽ giúp bạn trở thành một thương nhân tài ba hoặc một nhà thám hiểm săn tìm kho báu hiệu quả!

---

**1. Các Yếu Tố Cốt Lõi Quyết Định Giá Trị:**

*   **\`Cảnh Giới Vật Phẩm\` (Item Realm):**
    *   Đây là yếu tố **quan trọng nhất**. Một vật phẩm "Luyện Khí Kỳ" sẽ có giá trị cao hơn rất nhiều so với vật phẩm "Phàm Nhân".
    *   Giá trị tăng theo cấp số nhân qua mỗi đại cảnh giới. Một vật phẩm "Nguyên Anh Kỳ" có thể đắt gấp hàng chục, thậm chí hàng trăm lần vật phẩm "Trúc Cơ Kỳ".
    *   **Mẹo:** Luôn để ý đến \`itemRealm\` khi chế tạo hoặc nhặt được vật phẩm. Nguyên liệu từ các khu vực cấp cao sẽ tạo ra vật phẩm có giá trị cao hơn.

*   **\`Độ Hiếm\` (Rarity):**
    *   Độ hiếm nhân thêm một hệ số rất lớn vào giá trị cơ bản của vật phẩm. Các bậc độ hiếm từ thấp đến cao: **Phổ Thông < Hiếm < Quý Báu < Cực Phẩm < Thần Thoại < Chí Tôn**.
    *   Một vật phẩm \`Cực Phẩm\` có thể đắt gấp 20 lần một vật phẩm \`Phổ Thông\` cùng cảnh giới.

*   **\`Loại Vật Phẩm\` (Item Category):**
    *   Các loại vật phẩm khác nhau có giá trị cơ bản khác nhau. Ví dụ, một quyển **Công Pháp** hay **Linh Kĩ** thường sẽ có giá trị cao hơn nhiều so với **Nguyên Liệu** cùng cấp.

---

**2. Chi Tiết Giá Trị Của Trang Bị (Equipment):**

Trang bị là loại vật phẩm có giá trị phức tạp nhất, vì nó được cộng hưởng từ nhiều yếu tố:

*   **Chỉ Số Cộng Thêm (Stat Bonuses):**
    *   Mỗi điểm chỉ số cộng thêm đều có giá trị. Ví dụ, mỗi điểm \`Sức Tấn Công\` cộng thêm đều rất giá trị, trong khi \`Sinh Lực Tối Đa\` có giá trị trên mỗi điểm thấp hơn nhưng thường được cộng với số lượng lớn.
    *   AI sẽ tự động tính toán giá trị dựa trên các chỉ số này.

*   **Hiệu Ứng Đặc Biệt (Unique Effects):**
    *   Đây là yếu tố "ăn tiền" nhất của trang bị cao cấp!
    *   Các hiệu ứng càng mạnh, càng hiếm thì giá trị càng tăng vọt. Một món đồ có nhiều dòng hiệu ứng tốt sẽ là một món hời cực lớn.
    *   **Các hiệu ứng ví dụ có giá trị cao:**
        *   \`hút máu %\`
        *   \`tăng % sát thương chí mạng\`
        *   \`xuyên giáp % / bỏ qua phòng thủ %\`
        *   \`tăng tốc độ tấn công\`
        *   \`miễn nhiễm các hiệu ứng khống chế (choáng, câm lặng...)\`
        *   \`giảm thời gian hồi chiêu %\`

---

**3. Làm Giàu Trong Game:**

*   **Trở thành Bậc Thầy Luyện Chế:** Đây là con đường làm giàu bền vững. Hãy thu thập các nguyên liệu quý hiếm từ những khu vực nguy hiểm, sau đó dùng chức năng "Luyện Chế" để tạo ra các trang bị có chỉ số và hiệu ứng đặc biệt "khủng". Những món đồ này có thể được bán với giá trên trời.
*   **Săn Tìm Kho Báu:** Đánh bại các Boss mạnh hoặc khám phá các bí cảnh (dungeon) thường sẽ nhận được các vật phẩm có sẵn với chỉ số và hiệu ứng tốt. Bạn có thể giữ lại để dùng hoặc bán đi để lấy vốn.
*   **Đầu Cơ ở Đấu Giá Hội:** Nếu bạn có con mắt tinh tường, hãy mua các vật phẩm tiềm năng với giá hời ở Đấu Giá Hội và bán lại khi thị trường cần đến chúng.

Hiểu rõ hệ thống kinh tế sẽ mở ra một lối chơi hoàn toàn mới, không chỉ là chiến đấu mà còn là làm giàu và xây dựng cơ nghiệp trong thế giới tu tiên rộng lớn!
`;
