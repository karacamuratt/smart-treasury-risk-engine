import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    /**
     * whitelist:
     * Removes unknown properties from incoming payloads.
     *
     * forbidNonWhitelisted:
     * Throws an error if unexpected fields are sent.
     *
     * transform:
     * Transforms plain JSON into DTO class instances.
     */

    await app.listen(3000);
}
bootstrap();
