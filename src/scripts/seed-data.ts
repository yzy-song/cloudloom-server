// src/seed-data.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../modules/products/products.service';
import { BookingsService } from '../modules/bookings/bookings.service';
import { CollaborationApplicationsService } from '../modules/collaboration-applications/collaboration-applications.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productsService = app.get(ProductsService);
  const bookingsService = app.get(BookingsService);
  const collaborationService = app.get(CollaborationApplicationsService); // 更新为新服务

  console.log('开始填充种子数据...');

  try {
    // 清空现有数据
    console.log('清空现有数据...');
    // 注意：在实际生产环境中应该禁用或谨慎使用此操作
    // await productsService.clearAll();
    // await bookingsService.clearAll();
    // await collaborationService.clearAll(); // 更新为新服务

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
        sizeOptions: ['S', 'M', 'L'],
        careInstructions: '建议干洗',
        details: ['面料: 100% 桑蚕丝', '工艺: 提花、刺绣', '特点: 轻薄透气，飘逸灵动'],
        tags: ['新品', '唐风'],
        images: ['/assets/images/product1-1.jpg', '/assets/images/product1-2.jpg'],
        stockQuantity: 5,
        isActive: true,
      },
      {
        title: '宋制褙子裙 · 清风徐来',
        description: '简约优雅的宋制风格，面料挺括，线条流畅，适合日常穿着',
        price: 79.99,
        category: '褙子',
        dynasty: 'song',
        dynastyLabel: '宋',
        material: '棉麻混纺',
        sizeOptions: ['S', 'M', 'L'],
        careInstructions: '可机洗',
        details: ['面料: 棉麻混纺', '工艺: 剪裁', '特点: 简约、日常、舒适'],
        tags: ['经典', '宋制'],
        images: ['/assets/images/product2-1.jpg', '/assets/images/product2-2.jpg'],
        stockQuantity: 3,
        isActive: true,
      },
      {
        title: '明制袄裙 · 灼灼其华',
        description: '明朝时期女子常服，端庄大气，采用云锦面料，彰显华贵典雅',
        price: 99.99,
        category: '袄裙',
        dynasty: 'ming',
        dynastyLabel: '明',
        material: '云锦',
        sizeOptions: ['S', 'M', 'L'],
        careInstructions: '建议干洗',
        details: ['面料: 云锦', '工艺: 织造、刺绣', '特点: 华贵、端庄'],
        tags: ['新品', '明制'],
        images: ['/assets/images/product3-1.jpg', '/assets/images/product3-2.jpg'],
        stockQuantity: 2,
        isActive: true,
      },
    ];

    const createdProducts: any[] = [];
    for (const productData of products) {
      const product = await productsService.create(productData as any);
      console.log(`产品 \"${product.title}\" 创建成功`);
      createdProducts.push(product);
    }

    // 添加预约数据
    console.log('添加预约数据...');
    const bookings = [
      {
        fullName: '张三',
        contactInfo: 'zhangsan@email.com',
        productId: createdProducts[0].id,
        selectedSize: 'M',
        bookingDate: '2024-03-15',
        timeSlot: '10:00 - 11:30',
        notes: '需要儿童尺寸',
        totalAmount: 89.99,
        status: 'confirmed',
      },
      {
        fullName: '李四',
        contactInfo: 'lisi@email.com',
        productId: createdProducts[1].id,
        selectedSize: 'L',
        bookingDate: '2024-03-16',
        timeSlot: '14:30 - 16:00',
        totalAmount: 79.99,
        status: 'pending',
      },
    ];

    for (const bookingData of bookings) {
      const booking = await bookingsService.create(bookingData as any);
      console.log(`预约 \"${booking.data.bookingNumber}\" 创建成功`);
    }

    // 添加合作申请数据
    console.log('添加合作申请数据...');
    const collaborationApplications = [
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
        contact: 'zhaoliu@event.com',
        company: 'XX策划公司',
        collaborationType: 2,
        message: '我们正在寻找汉服供应商进行寄售合作。',
        status: 'contacted',
      },
    ];

    for (const applicationData of collaborationApplications) {
      const application = await collaborationService.create(applicationData as any);
      console.log(`合作申请 \"${application.name}\" 创建成功`);
    }
  } catch (error) {
    console.error('种子数据填充失败:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
