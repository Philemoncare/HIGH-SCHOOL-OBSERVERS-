-- HSO Platform PostgreSQL Schema
-- This file creates all tables for the High School Observer platform

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('user', 'public', 'school_rep', 'executive', 'admin', 'super_admin');
CREATE TYPE user_provider AS ENUM ('local', 'google', 'facebook', 'twitter');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'auto');
CREATE TYPE language_type AS ENUM ('en', 'es', 'fr');
CREATE TYPE time_format_type AS ENUM ('12h', '24h');
CREATE TYPE dashboard_layout_type AS ENUM ('grid', 'list');
CREATE TYPE event_category AS ENUM ('conference', 'workshop', 'symposium', 'briefing', 'networking', 'summit');
CREATE TYPE event_status AS ENUM ('active', 'cancelled', 'completed', 'draft');
CREATE TYPE news_category AS ENUM ('policy', 'technology', 'wellness', 'education', 'leadership', 'finance', 'news');
CREATE TYPE news_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE donation_category AS ENUM ('education', 'health', 'emergency', 'community', 'other');
CREATE TYPE donation_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    school_name VARCHAR(255),
    school_location VARCHAR(255),
    phone VARCHAR(50),
    profile_image TEXT,
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    password_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),
    twitter_id VARCHAR(255),
    provider user_provider DEFAULT 'local',
    two_fa_enabled BOOLEAN DEFAULT false,
    two_fa_code VARCHAR(10),
    two_fa_code_expires TIMESTAMP,
    preferences JSONB DEFAULT '{
        "theme": "light",
        "language": "en",
        "timezone": "UTC",
        "date_format": "MM/DD/YYYY",
        "time_format": "12h",
        "dashboard_layout": "grid",
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        }
    }'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip VARCHAR(45)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category event_category DEFAULT 'conference',
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    image TEXT,
    price VARCHAR(50) DEFAULT 'Free',
    capacity INTEGER DEFAULT 100,
    registered INTEGER DEFAULT 0,
    status event_status DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    urgent BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category news_category DEFAULT 'education',
    author VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image TEXT,
    tags TEXT[] DEFAULT '{}',
    status news_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Donation campaigns table
CREATE TABLE donation_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    goal_amount DECIMAL(12,2) NOT NULL,
    raised_amount DECIMAL(12,2) DEFAULT 0.00,
    beneficiary VARCHAR(255) NOT NULL,
    category donation_category DEFAULT 'other',
    status donation_status DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    urgent BOOLEAN DEFAULT false,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leadership table
CREATE TABLE leadership (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    bio TEXT,
    image TEXT,
    email VARCHAR(255),
    avatar_emoji VARCHAR(10),
    social_links JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password resets table
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    items JSONB NOT NULL,
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit table
CREATE TABLE audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created_by ON news(created_by);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_donation_campaigns_status ON donation_campaigns(status);
CREATE INDEX idx_donation_campaigns_created_by ON donation_campaigns(created_by);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_audit_user_id ON audit(user_id);
CREATE INDEX idx_audit_resource ON audit(resource_type, resource_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_campaigns_updated_at BEFORE UPDATE ON donation_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leadership_updated_at BEFORE UPDATE ON leadership FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
