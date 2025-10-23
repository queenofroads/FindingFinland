-- Insert initial quests for Finding Finland

-- LEGAL QUESTS
INSERT INTO quests (title, description, category, points, icon, order_index, tips) VALUES
('Register Your Address', 'Register your residential address with the Digital and Population Data Services Agency (DVV)', 'legal', 50, '🏠', 1, 'Visit maistraatti.fi or your local service point. Bring your passport and rental agreement.'),
('Apply for Finnish Personal Identity Code', 'Get your Finnish personal identity code (henkilötunnus)', 'legal', 50, '🆔', 2, 'This happens automatically when you register your address. You''ll receive it by mail within 1-2 weeks.'),
('Open a Finnish Bank Account', 'Open a bank account with a Finnish bank (OP, Nordea, Danske, S-Pankki, etc.)', 'legal', 40, '🏦', 3, 'You''ll need your personal identity code. Many banks offer English-speaking services.'),
('Register for Kela (Social Insurance)', 'Register with the Social Insurance Institution of Finland', 'legal', 40, '📋', 4, 'Visit kela.fi or a local Kela office. Bring passport, employment contract, and residence permit.'),
('Apply for Tax Card', 'Get your tax card from the Finnish Tax Administration', 'legal', 30, '💳', 5, 'Apply online at vero.fi/en. You''ll need your personal identity code.'),
('Register for Residence Permit', 'If staying over 90 days, register your residence permit with Finnish Immigration Service', 'legal', 60, '📄', 6, 'Visit migri.fi. Processing can take several months, so apply early.'),
('Get a Library Card', 'Register for a free library card at your local library', 'legal', 10, '📚', 7, 'Libraries offer free books, computers, internet, and often Finnish language courses.');

-- SOCIAL QUESTS
INSERT INTO quests (title, description, category, points, icon, order_index, tips) VALUES
('Join "Expats in Finland" Facebook Group', 'Connect with other expats and immigrants in Finland', 'social', 10, '👥', 1, 'Search for groups like "Expats in Finland", "New in Helsinki", or city-specific groups.'),
('Attend a Local Meetup Event', 'Join a meetup.com event or local community gathering', 'social', 20, '🤝', 2, 'Check meetup.com, eventbrite, or local Facebook groups for events.'),
('Visit InfoFinland Website', 'Explore InfoFinland.fi - the official guide for immigrants', 'social', 10, '💻', 3, 'This website has comprehensive information in multiple languages about living in Finland.'),
('Join a Finnish Language Course', 'Enroll in Finnish language classes (many are free!)', 'social', 40, '🗣️', 4, 'Check with your local library, Kela offers integration courses, or try Helsinki Adult Education Centre.'),
('Attend a Local Festival', 'Experience a Finnish festival or community event', 'social', 30, '🎉', 5, 'Check local event calendars. Popular festivals include Vappu (May Day), Juhannus (Midsummer), and Christmas markets.'),
('Join a Hobby Club', 'Join a local sports club, book club, or hobby group', 'social', 25, '⚽', 6, 'Many municipalities offer free or low-cost hobby activities. Check your city''s website.'),
('Connect with International House', 'Visit your local International House for expat services', 'social', 15, '🌍', 7, 'International Houses provide guidance, events, and networking opportunities for newcomers.');

-- CULTURAL QUESTS
INSERT INTO quests (title, description, category, points, icon, order_index, tips) VALUES
('Experience a Finnish Sauna', 'Try the quintessential Finnish tradition of sauna', 'cultural', 30, '🧖', 1, 'Many apartments have saunas. You can also visit public saunas like Löyly or Kotiharjun Sauna in Helsinki.'),
('Learn Basic Finnish Greetings', 'Learn to say: Hei (Hi), Kiitos (Thank you), Anteeksi (Sorry/Excuse me)', 'cultural', 10, '👋', 2, 'Finns appreciate when you try to speak Finnish, even just a few words!'),
('Visit a Finnish Museum', 'Explore Finnish culture at a local museum', 'cultural', 20, '🏛️', 3, 'Try the National Museum, Design Museum, or Ateneum. Many museums have free entry days.'),
('Experience the Midnight Sun or Polar Night', 'Witness Finland''s unique seasonal light phenomena', 'cultural', 40, '🌞', 4, 'Summer: Sun doesn''t set in the north. Winter: Very short days in the south, no sun in the north.'),
('Try Ice Swimming (Avanto)', 'Take a dip in icy water (with sauna after!)', 'cultural', 35, '🥶', 5, 'Popular winter activity. Always go with experienced swimmers first!'),
('Visit a Finnish National Park', 'Explore Finland''s beautiful nature in a national park', 'cultural', 30, '🌲', 6, 'Finland has 40 national parks. Nuuksio (near Helsinki) is very accessible. Remember "everyman''s rights" (jokamiehenoikeus).'),
('Celebrate a Finnish Holiday', 'Participate in Finnish holiday traditions', 'cultural', 25, '🎄', 7, 'Try Vappu (May 1), Juhannus (Midsummer), or Independence Day (Dec 6). Each has unique traditions.'),
('Learn About Sisu', 'Understand the Finnish concept of "sisu" (determination/resilience)', 'cultural', 15, '💪', 8, 'Sisu represents Finnish determination and courage. Read about it and try to embody it in your daily life!');

-- FOOD QUESTS
INSERT INTO quests (title, description, category, points, icon, order_index, tips) VALUES
('Try Karjalanpiirakka', 'Taste Karelian pasties (rice-filled pastries)', 'food', 15, '🥟', 1, 'Available at any supermarket. Traditionally eaten with egg butter (munavoi). Perfect breakfast!'),
('Drink Finnish Coffee', 'Finland is the world''s biggest coffee consumer per capita!', 'food', 10, '☕', 2, 'Try filter coffee (kahvi). Finns drink it all day long, often with pulla (sweet bread).'),
('Taste Salmiakki', 'Try Finland''s famous salty licorice candy', 'food', 20, '🍬', 3, 'Salmiakki is an acquired taste! Start with mild versions. You''ll either love it or hate it.'),
('Eat Ruisleipä', 'Try authentic Finnish rye bread', 'food', 10, '🍞', 4, 'Dark, dense, and healthy. Finns eat it daily. Great with butter and cheese.'),
('Try Korvapuusti', 'Taste Finnish cinnamon rolls (different from Swedish!)', 'food', 15, '🥐', 5, 'Available at cafes and bakeries. Often enjoyed with coffee during "kahvitauko" (coffee break).'),
('Sample Mustamakkara', 'Try traditional Finnish black sausage (blood sausage)', 'food', 25, '🌭', 6, 'A specialty from Tampere. Eaten with lingonberry jam. Not for everyone, but very traditional!'),
('Taste Leipäjuusto', 'Try Finnish "squeaky cheese" (bread cheese)', 'food', 20, '🧀', 7, 'Often served warm with cloudberry jam. Has a unique squeaky texture when you bite it.'),
('Try Grillimakkara', 'Eat a Finnish grilled sausage at a grill kiosk', 'food', 15, '🌭', 8, 'Classic Finnish street food. Try at a "grilli" kiosk, especially late at night!'),
('Sample Finnish Berries', 'Pick or buy local berries (blueberries, lingonberries, cloudberries)', 'food', 20, '🫐', 9, 'You can pick berries freely in forests (everyman''s rights). Summer and autumn are best.'),
('Taste Mämmi', 'Try traditional Finnish Easter dessert made from rye', 'food', 30, '🍮', 10, 'Mämmi looks unusual but tastes sweet. Eaten with cream and sugar. Available around Easter.');

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, points_required, badge_color) VALUES
('Welcome to Finland!', 'Complete your first quest', '🎯', 10, '#10b981'),
('Legal Eagle', 'Complete all legal quests', '⚖️', 270, '#3b82f6'),
('Social Butterfly', 'Complete all social quests', '🦋', 150, '#8b5cf6'),
('Culture Vulture', 'Complete all cultural quests', '🎭', 235, '#ec4899'),
('Foodie Explorer', 'Complete all food quests', '🍴', 180, '#f59e0b'),
('Century Club', 'Earn 100 total points', '💯', 100, '#ef4444'),
('Half Finn', 'Earn 500 total points', '🏆', 500, '#f97316'),
('Honorary Finn', 'Complete all quests!', '👑', 835, '#fbbf24');
