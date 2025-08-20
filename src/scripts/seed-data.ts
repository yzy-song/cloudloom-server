import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../modules/products/products.service';
import { BookingsService } from '../modules/bookings/bookings.service';
import { InquiriesService } from '../modules/inquiries/inquiries.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productsService = app.get(ProductsService);
  const bookingsService = app.get(BookingsService);
  const inquiriesService = app.get(InquiriesService);

  console.log('开始填充种子数据...');

  try {
    // 清空现有数据
    console.log('清空现有数据...');
    // 注意：在实际生产环境中应该禁用或谨慎使用此操作
    // await productsService.clearAll();
    // await bookingsService.clearAll();
    // await inquiriesService.clearAll();

    // 添加产品数据
    console.log('添加产品数据...');
    const products = [
      {
        title: '唐风齐胸襦裙 · 霓裳羽衣',
        description: '灵感来自盛唐时期的女子服饰，采用真丝提花面料，裙头绣有传统缠枝纹样',
        price: 89.99,
        category: '齐胸襦裙',
        dynasty: 'tang',
        dynastyLabel: '唐',
        material: '100%桑蚕丝',
        sizeOptions: ['S', 'M', 'L', 'XL'],
        careInstructions: '手洗，不可漂白，低温熨烫',
        details: ['100% 天然桑蚕丝面料', '手工刺绣装饰纹样', '可拆卸披帛设计', '渐变染色工艺', '传统缠枝莲纹样'],
        tags: ['热门', '新品', '真丝'],
        images: ['tang-dress-1.jpg', 'tang-dress-2.jpg'],
        reviews: 28,
        stockQuantity: 5,
      },
      {
        title: '宋制百迭裙',
        description: '宋代风格的百迭裙，清新淡雅，体现宋代文人雅士的审美',
        price: 79.99,
        category: '百迭裙',
        dynasty: 'song',
        dynastyLabel: '宋',
        material: '棉麻混纺',
        sizeOptions: ['S', 'M', 'L'],
        careInstructions: '手洗，阴干',
        details: ['棉麻混纺面料', '手工褶裥工艺', '清新淡雅配色', '宋代传统纹样'],
        tags: ['简约', '日常'],
        images: ['song-dress-1.jpg', 'song-dress-2.jpg'],
        reviews: 15,
        stockQuantity: 3,
      },
      {
        title: '明制马面裙',
        description: '明代经典马面裙，端庄大气，适合各种正式场合',
        price: 99.99,
        category: '马面裙',
        dynasty: 'ming',
        dynastyLabel: '明',
        material: '织金缎',
        sizeOptions: ['S', 'M', 'L', 'XL'],
        careInstructions: '干洗',
        details: ['高级织金缎面料', '手工缝制', '传统云纹图案', '可调节腰围'],
        tags: ['豪华', '正式', '织金'],
        images: ['ming-dress-1.jpg', 'ming-dress-2.jpg'],
        reviews: 42,
        stockQuantity: 2,
      },
      {
        title: '汉服刺绣团扇',
        description: '手工刺绣真丝团扇，传统纹样设计，汉服搭配佳品',
        price: 24.99,
        category: '配饰',
        dynasty: '通用',
        dynastyLabel: '通用',
        material: '真丝、竹',
        sizeOptions: ['标准'],
        careInstructions: '避免潮湿',
        details: ['手工双面刺绣', '天然竹制扇骨', '传统吉祥图案', '精美礼盒包装'],
        tags: ['配饰', '手工', '礼品'],
        images: ['fan-1.jpg', 'fan-2.jpg'],
        reviews: 36,
        stockQuantity: 20,
      },
    ];

    const createdProducts: Array<{ id: string | number }> = [];
    for (const productData of products) {
      const product = await productsService.create(productData as any);
      createdProducts.push(product);
      console.log(`产品 "${product.title}" 创建成功`);
    }

    // 添加预约数据
    console.log('添加预约数据...');
    const bookings = [
      {
        customerName: '张三',
        contactInfo: 'zhangsan@email.com',
        productId: createdProducts[0].id,
        selectedSize: 'M',
        bookingDate: '2024-03-15',
        timeSlot: '10:00 - 11:30',
        notes: '需要儿童尺寸',
        totalPrice: 89.99,
        status: 'confirmed',
      },
      {
        customerName: '李四',
        contactInfo: 'lisi@email.com',
        productId: createdProducts[1].id,
        selectedSize: 'L',
        bookingDate: '2024-03-16',
        timeSlot: '14:30 - 16:00',
        totalPrice: 79.99,
        status: 'pending',
      },
    ];

    for (const bookingData of bookings) {
      const booking = await bookingsService.create(bookingData as any);
      console.log(`预约 "${booking.customerName}" 创建成功`);
    }

    // 添加咨询数据
    console.log('添加咨询数据...');
    const inquiries = [
      {
        name: '王五',
        contact: 'wangwu@company.com',
        company: '某某文化公司',
        collaborationType: 3,
        message: '我们想与贵馆建立长期合作关系，共同举办汉服文化展览活动。',
        status: 'new',
      },
      {
        name: '赵六',
        contact: 'zhaoliu@shop.com',
        collaborationType: 1,
        message: '我想批发采购贵馆的汉服产品，请问是否有折扣？',
        status: 'contacted',
      },
    ];

    for (const inquiryData of inquiries) {
      const inquiry = await inquiriesService.create(inquiryData as any);
      console.log(`咨询 "${inquiry.name}" 创建成功`);
    }

    console.log('种子数据填充完成！');
  } catch (error) {
    console.error('填充种子数据时出错:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
