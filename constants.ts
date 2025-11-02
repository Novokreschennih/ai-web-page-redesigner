export const DESIGN_STYLES: string[] = [
  'На усмотрение ИИ',
  'Современный',
  'Минималистичный',
  'Брутализм',
  'Корпоративный',
  'Игривый',
  'Неоморфизм',
  'Глассморфизм',
  'Киберпанк',
  'Винтаж',
];

export const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Product</title>
    <style>
        body { font-family: sans-serif; background: #f0f0f0; color: #333; }
        .container { max-width: 900px; margin: 40px auto; padding: 20px; background: white; border: 1px solid #ddd; }
        h1 { color: #005a9c; }
        .feature { margin-bottom: 20px; padding: 15px; background: #e7f3ff; }
        button { background: #007bff; color: white; border: none; padding: 10px 15px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Introducing the All-New Product X</h1>
        <p>The revolutionary solution you've been waiting for. It's faster, smarter, and more efficient than ever before.</p>
        
        <div class="feature">
            <h2>Blazing Fast Speed</h2>
            <p>Experience performance like never before. Our new architecture is optimized for speed.</p>
        </div>

        <div class="feature">
            <h2>Intuitive Interface</h2>
            <p>A user-friendly design that makes complex tasks simple and enjoyable.</p>
        </div>
        
        <button onclick="alert('Thanks for your interest!')">Learn More</button>
    </div>
</body>
</html>
`;

export const INITIAL_TARGET_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Our Company</title>
</head>
<body>
    <header>
        <h1>About Us</h1>
        <nav>
            <a href="#">Home</a>
            <a href="#">Services</a>
            <a href="#">Contact</a>
        </nav>
    </header>
    <main>
        <section>
            <h2>Our Mission</h2>
            <p>To deliver excellence and innovation in everything we do. We strive to create value for our customers and stakeholders.</p>
        </section>
        <section>
            <h2>Our Team</h2>
            <p>We are a diverse team of passionate professionals dedicated to achieving our goals.</p>
            <ul>
                <li>Jane Doe - CEO</li>
                <li>John Smith - CTO</li>
                <li>Emily White - Lead Designer</li>
            </ul>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Our Company. All rights reserved.</p>
    </footer>
</body>
</html>
`;