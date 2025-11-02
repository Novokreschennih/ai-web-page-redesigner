
export const DESIGN_STYLES: string[] = [
  'Modern',
  'Minimalist',
  'Brutalist',
  'Corporate',
  'Playful',
  'Neumorphic',
  'Glassmorphism',
  'Cyberpunk',
  'Vintage',
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
