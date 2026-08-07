import requests
from bs4 import BeautifulSoup
import re
import json
import time
import copy
from urllib.parse import urlparse, urljoin

class WebAnalyzer:
    def __init__(self, url: str):
        self.url = url
        self.success = False
        self.error = None
        self.response = None
        self.soup = None
        self.load_time = 0.0

        try:
            start_time = time.time()
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            self.response = requests.get(self.url, timeout=10, headers=headers)
            self.load_time = time.time() - start_time
            self.response.raise_for_status()
            self.soup = BeautifulSoup(self.response.text, 'lxml')
            self.success = True
        except Exception as e:
            self.error = str(e)

    def analyze(self) -> dict:
        if not self.success:
            return {"url": self.url, "success": False, "error": self.error}
        return {
            "url": self.url,
            "success": True,
            "basic_info": self._get_basic_info(),
            "seo": self._analyze_seo(),
            "headings": self._extract_headings(),
            "links": self._extract_links(),
            "images": self._extract_images(),
            "technologies": self._detect_technologies(),
            "meta_tags": self._extract_meta_tags(),
            "content": self._analyze_content(),
            "social_links": self._extract_social_links(),
            "performance": self._get_performance_info(),
            "readability": self._analyze_readability(),
            "keyword_density": self._analyze_keyword_density(),
            "security": self._analyze_security_headers(),
            "accessibility": self._analyze_accessibility(),
            "page_speed": self._analyze_page_speed_factors(),
            "structured_data": self._extract_structured_data(),
            "url_analysis": self._analyze_url_structure(),
            "contact_info": self._extract_contact_info()
        }

    def _get_basic_info(self):
        title = self.soup.title.string.strip() if self.soup.title and self.soup.title.string else ""
        return {
            "title": title,
            "status_code": self.response.status_code,
            "content_type": self.response.headers.get("Content-Type", ""),
            "server": self.response.headers.get("Server", "Unknown")
        }

    def _analyze_seo(self):
        title = self.soup.title.string if self.soup.title and self.soup.title.string else ""
        meta_desc = self.soup.find("meta", attrs={"name": "description"})
        desc = meta_desc.get("content", "") if meta_desc else ""
        
        h1_tags = self.soup.find_all("h1")
        canonical = self.soup.find("link", rel="canonical")
        viewport = self.soup.find("meta", attrs={"name": "viewport"})
        html_tag = self.soup.find("html")
        lang = html_tag.get("lang") if html_tag else None
        favicon = self.soup.find("link", rel=re.compile("icon"))
        robots_meta = self.soup.find("meta", attrs={"name": "robots"})
        
        # Check Structured Data
        structured_data = self.soup.find("script", type="application/ld+json")
        
        # Open Graph
        og_tags = self.soup.find_all("meta", attrs={"property": re.compile(r"^og:")})
        
        # Images alt text
        images = self.soup.find_all("img")
        images_with_alt = [img for img in images if img.get("alt")]
        
        checks = []
        total_points = 0
        earned_points = 0
        
        def add_check(name, passed, detail, points, max_points):
            nonlocal total_points, earned_points
            total_points += max_points
            earned_points += points
            checks.append({
                "name": name,
                "passed": passed,
                "detail": detail,
                "points": points,
                "max_points": max_points
            })
            
        add_check("Title Tag", bool(title), "Has title tag" if title else "Missing title tag", 10 if title else 0, 10)
        
        title_len_passed = 30 <= len(title) <= 60
        add_check("Title Length", title_len_passed, f"Length is {len(title)} (ideal: 30-60)", 5 if title_len_passed else 0, 5)
        
        add_check("Meta Description", bool(desc), "Has meta description" if desc else "Missing meta description", 10 if desc else 0, 10)
        
        desc_len_passed = 120 <= len(desc) <= 160
        add_check("Description Length", desc_len_passed, f"Length is {len(desc)} (ideal: 120-160)", 5 if desc_len_passed else 0, 5)
        
        h1_count = len(h1_tags)
        add_check("H1 Tag", h1_count == 1, f"Found {h1_count} H1 tags (ideal: exactly 1)", 10 if h1_count == 1 else 0, 10)
        
        add_check("Canonical URL", bool(canonical), "Has canonical URL" if canonical else "Missing canonical URL", 5 if canonical else 0, 5)
        
        add_check("Viewport Meta", bool(viewport), "Has viewport meta tag" if viewport else "Missing viewport meta tag", 5 if viewport else 0, 5)
        
        add_check("Language Attribute", bool(lang), "Has language attribute" if lang else "Missing language attribute", 5 if lang else 0, 5)
        
        add_check("Favicon", bool(favicon), "Has favicon" if favicon else "Missing favicon", 5 if favicon else 0, 5)
        
        uses_https = self.url.startswith("https")
        add_check("HTTPS", uses_https, "Uses HTTPS" if uses_https else "Uses HTTP", 10 if uses_https else 0, 10)
        
        add_check("Robots Meta", bool(robots_meta), "Has robots meta tag" if robots_meta else "Missing robots meta tag", 5 if robots_meta else 0, 5)
        
        add_check("Structured Data", bool(structured_data), "Has structured data (JSON-LD)" if structured_data else "Missing structured data", 5 if structured_data else 0, 5)
        
        add_check("Open Graph Tags", len(og_tags) > 0, f"Found {len(og_tags)} Open Graph tags" if og_tags else "Missing Open Graph tags", 5 if len(og_tags) > 0 else 0, 5)
        
        score = int((earned_points / total_points) * 100) if total_points > 0 else 0
        
        return {
            "score": score,
            "checks": checks
        }

    def _extract_headings(self):
        headings = {}
        for i in range(1, 7):
            tags = self.soup.find_all(f"h{i}")
            headings[f"h{i}"] = [t.get_text(strip=True)[:100] for t in tags]
        return headings

    def _extract_links(self):
        domain = urlparse(self.url).netloc
        internal, external = 0, 0
        for a in self.soup.find_all('a', href=True):
            href = a['href']
            if href.startswith('http'):
                if domain in href:
                    internal += 1
                else:
                    external += 1
            else:
                internal += 1
        return {"internal": internal, "external": external, "total": internal + external}

    def _extract_images(self):
        images = self.soup.find_all('img')
        missing_alt = [img.get('src', 'unknown') for img in images if not img.get('alt')]
        return {
            "total": len(images),
            "missing_alt_count": len(missing_alt),
            "missing_alt_examples": missing_alt[:5]
        }

    def _detect_technologies(self):
        techs = []
        html = self.soup.prettify()
        if "wp-content" in html or "wp-includes" in html: techs.append("WordPress")
        if "react" in html.lower() or "data-reactroot" in html: techs.append("React")
        if "next/router" in html or "_next/static" in html: techs.append("Next.js")
        if "angular" in html.lower() or "ng-version" in html: techs.append("Angular")
        if "vue" in html.lower() or "data-v-" in html: techs.append("Vue.js")
        if "bootstrap" in html.lower(): techs.append("Bootstrap")
        if "tailwind" in html.lower(): techs.append("Tailwind CSS")
        if "jquery" in html.lower(): techs.append("jQuery")
        return {"detected": techs}

    def _extract_meta_tags(self):
        meta = {"og": {}, "twitter": {}, "other": []}
        for tag in self.soup.find_all("meta"):
            name = tag.get("name") or tag.get("property")
            content = tag.get("content", "")
            if name:
                if name.startswith("og:"):
                    meta["og"][name] = content
                elif name.startswith("twitter:"):
                    meta["twitter"][name] = content
                else:
                    meta["other"].append({"name": name, "content": content})
        return meta

    def _analyze_content(self):
        soup_copy = copy.copy(self.soup)
        for el in soup_copy(["script", "style", "noscript", "header", "footer", "nav"]):
            el.decompose()
        text = soup_copy.get_text(separator=' ', strip=True)
        word_count = len(text.split())
        return {"word_count": word_count}

    def _extract_social_links(self):
        socials = []
        platforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'github.com', 't.me']
        seen = set()
        for a in self.soup.find_all('a', href=True):
            href = a['href']
            if href in seen: continue
            for p in platforms:
                if p in href:
                    platform_name = p.split('.')[0]
                    if platform_name == 't': platform_name = 'telegram'
                    socials.append({"platform": platform_name, "url": href})
                    seen.add(href)
                    break
        return socials

    def _get_performance_info(self):
        size = len(self.response.content)
        size_mb = size / (1024 * 1024)
        formatted = f"{size_mb:.2f} MB" if size_mb > 1 else f"{size / 1024:.2f} KB"
        
        return {
            "load_time": round(self.load_time, 2),
            "page_size_bytes": size,
            "page_size_formatted": formatted,
            "status_code": self.response.status_code,
            "content_type": self.response.headers.get("Content-Type", ""),
            "scripts_count": len(self.soup.find_all("script")),
            "stylesheets_count": len(self.soup.find_all("link", rel="stylesheet"))
        }

    def _get_visible_text(self):
        soup_copy = copy.copy(self.soup)
        for script in soup_copy(["script", "style", "noscript"]):
            script.decompose()
        return soup_copy.get_text(separator=' ', strip=True)

    def _analyze_readability(self):
        text = self._get_visible_text()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 3]
        words = re.findall(r'\b\w+\b', text.lower())
        
        num_sentences = len(sentences) if len(sentences) > 0 else 1
        num_words = len(words) if len(words) > 0 else 1
        
        avg_sentence_length = num_words / num_sentences
        avg_word_length = sum(len(w) for w in words) / num_words if num_words else 0
        
        # Simple syllable count heuristic
        def count_syllables(word):
            word = word.lower()
            count = len(re.findall(r'[aeiouy]+', word))
            if word.endswith('e') and not word.endswith('le'):
                count -= 1
            return max(1, count)
            
        num_syllables = sum(count_syllables(w) for w in words)
        
        # Flesch Reading Ease
        flesch_reading_ease = 206.835 - 1.015 * (num_words / num_sentences) - 84.6 * (num_syllables / num_words)
        flesch_reading_ease = max(0, min(100, flesch_reading_ease))
        
        # Flesch-Kincaid Grade Level
        grade_level = 0.39 * (num_words / num_sentences) + 11.8 * (num_syllables / num_words) - 15.59
        grade_level = max(0, grade_level)
        
        if flesch_reading_ease > 90: interpretation = "very easy"
        elif flesch_reading_ease > 80: interpretation = "easy"
        elif flesch_reading_ease > 70: interpretation = "fairly easy"
        elif flesch_reading_ease > 60: interpretation = "standard"
        elif flesch_reading_ease > 50: interpretation = "fairly difficult"
        elif flesch_reading_ease > 30: interpretation = "difficult"
        else: interpretation = "very difficult"
        
        return {
            "flesch_reading_ease": round(flesch_reading_ease, 2),
            "grade_level": round(grade_level, 2),
            "avg_sentence_length": round(avg_sentence_length, 2),
            "avg_word_length": round(avg_word_length, 2),
            "syllable_count": num_syllables,
            "interpretation": interpretation
        }

    def _analyze_keyword_density(self):
        text = self._get_visible_text()
        words = re.findall(r'\b[a-z]{2,}\b', text.lower())
        
        stop_words = set([
            "a", "an", "the", "is", "it", "to", "in", "of", "and", "or", "for", "on", "at", "by", "with", "as", "be", 
            "was", "are", "were", "has", "have", "had", "do", "does", "did", "will", "would", "could", "should", "can", 
            "may", "might", "shall", "this", "that", "these", "those", "i", "you", "he", "she", "we", "they", "me", 
            "him", "her", "us", "them", "my", "your", "his", "its", "our", "their", "what", "which", "who", "whom", 
            "where", "when", "how", "why", "not", "no", "but", "if", "than", "too", "very", "just", "about", "up", "out", 
            "so", "from", "into", "over", "after", "before", "between", "under", "again", "then", "once", "here", "there", 
            "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "only", "own", "same", "also", 
            "new", "now", "get", "got"
        ])
        
        filtered_words = [w for w in words if w not in stop_words]
        total_words = len(filtered_words)
        
        freq = {}
        for w in filtered_words:
            freq[w] = freq.get(w, 0) + 1
            
        sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:15]
        
        keywords = []
        for w, c in sorted_freq:
            density = (c / total_words) * 100 if total_words > 0 else 0
            keywords.append({
                "word": w,
                "count": c,
                "density": round(density, 2)
            })
            
        return {
            "total_words": len(words),
            "unique_words": len(set(words)),
            "keywords": keywords
        }

    def _analyze_security_headers(self):
        headers = self.response.headers
        checks = [
            {"name": "X-Frame-Options", "present": "X-Frame-Options" in headers, "value": headers.get("X-Frame-Options"), "recommendation": "Use to prevent clickjacking"},
            {"name": "X-Content-Type-Options", "present": "X-Content-Type-Options" in headers, "value": headers.get("X-Content-Type-Options"), "recommendation": "Should be 'nosniff'"},
            {"name": "X-XSS-Protection", "present": "X-XSS-Protection" in headers, "value": headers.get("X-XSS-Protection"), "recommendation": "Use to block XSS attacks"},
            {"name": "Strict-Transport-Security", "present": "Strict-Transport-Security" in headers, "value": headers.get("Strict-Transport-Security"), "recommendation": "Crucial for enforcing HTTPS"},
            {"name": "Content-Security-Policy", "present": "Content-Security-Policy" in headers, "value": headers.get("Content-Security-Policy"), "recommendation": "Controls resources the user agent is allowed to load"},
            {"name": "Referrer-Policy", "present": "Referrer-Policy" in headers, "value": headers.get("Referrer-Policy"), "recommendation": "Controls how much referrer info is included"},
            {"name": "Permissions-Policy", "present": "Permissions-Policy" in headers, "value": headers.get("Permissions-Policy"), "recommendation": "Controls access to browser features"}
        ]
        
        score = sum([1 for c in checks if c["present"]])
        final_score = int((score / len(checks)) * 100)
        
        return {
            "score": final_score,
            "headers": checks
        }

    def _analyze_accessibility(self):
        images = self.soup.find_all('img')
        images_with_alt = [i for i in images if i.get('alt')]
        
        inputs = self.soup.find_all('input')
        
        landmarks = self.soup.find_all(attrs={"role": re.compile(r"^(nav|main|contentinfo)$")})
        main_tags = self.soup.find_all("main")
        nav_tags = self.soup.find_all("nav")
        footer_tags = self.soup.find_all("footer")
        has_landmarks = len(landmarks) > 0 or len(main_tags) > 0 or len(nav_tags) > 0 or len(footer_tags) > 0
        
        html_tag = self.soup.find('html')
        has_lang = html_tag and html_tag.get('lang') is not None
        
        has_title = self.soup.title and self.soup.title.string is not None
        
        checks = [
            {"name": "Images have alt text", "passed": len(images) == 0 or len(images_with_alt) / len(images) > 0.8, "detail": f"{len(images_with_alt)}/{len(images)} images have alt text"},
            {"name": "Document language", "passed": bool(has_lang), "detail": "HTML lang attribute is present" if has_lang else "Missing lang attribute"},
            {"name": "Page title", "passed": bool(has_title), "detail": "Title tag exists" if has_title else "Missing title tag"},
            {"name": "ARIA Landmarks", "passed": has_landmarks, "detail": "Semantic HTML5 or ARIA landmarks found" if has_landmarks else "No obvious landmarks found"}
        ]
        
        score = sum(1 for c in checks if c["passed"])
        final_score = int((score / len(checks)) * 100)
        
        return {
            "score": final_score,
            "checks": checks
        }

    def _analyze_page_speed_factors(self):
        dom_elements = len(self.soup.find_all(True))
        inline_scripts = self.soup.find_all("script", src=False)
        external_scripts = self.soup.find_all("script", src=True)
        inline_styles = self.soup.find_all("style")
        external_styles = self.soup.find_all("link", rel="stylesheet")
        
        render_blocking = 0
        head = self.soup.find("head")
        if head:
            for s in head.find_all("script", src=True):
                if not s.get("async") and not s.get("defer"):
                    render_blocking += 1
        
        lazy_images = self.soup.find_all("img", loading="lazy")
        
        encoding = self.response.headers.get("Content-Encoding", "none")
        
        return {
            "dom_element_count": dom_elements,
            "inline_script_count": len(inline_scripts),
            "inline_style_count": len(inline_styles),
            "external_scripts_count": len(external_scripts),
            "external_stylesheets_count": len(external_styles),
            "render_blocking_resources": render_blocking,
            "lazy_loading_images_count": len(lazy_images),
            "compression": encoding
        }

    def _extract_structured_data(self):
        scripts = self.soup.find_all("script", type="application/ld+json")
        data = []
        for s in scripts:
            try:
                content = json.loads(s.string)
                data.append(content)
            except:
                pass
        return data

    def _analyze_url_structure(self):
        parsed = urlparse(self.url)
        path = parsed.path
        
        has_hyphens = '-' in path
        has_underscores = '_' in path
        segments = [s for s in path.split('/') if s]
        
        return {
            "url_length": len(self.url),
            "uses_hyphens": has_hyphens,
            "uses_underscores": has_underscores,
            "path_segments": len(segments),
            "has_query_params": bool(parsed.query),
            "has_fragment": bool(parsed.fragment)
        }

    def _extract_contact_info(self):
        text = self.soup.get_text(separator=' ')
        html = self.response.text
        
        emails = list(set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text + " " + html)))
        
        phones = list(set(re.findall(r'(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4})', text + " " + html)))
        phones = [p.strip() for p in phones if len(p.strip()) > 8 and len(re.sub(r'\D', '', p)) >= 7]
        
        has_contact_page = False
        contact_urls = []
        for a in self.soup.find_all('a', href=True):
            if 'contact' in a['href'].lower() or 'contact' in a.get_text().lower():
                has_contact_page = True
                full_url = urljoin(self.url, a['href'])
                if full_url not in contact_urls and full_url.startswith('http'):
                    contact_urls.append(full_url)
                    
        # If emails not found, try fetching 1-2 contact pages quickly
        if not emails and contact_urls:
            for curl in contact_urls[:2]:
                try:
                    res = requests.get(curl, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
                    if res.status_code == 200:
                        ctext = BeautifulSoup(res.text, 'lxml').get_text(separator=' ')
                        new_emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', ctext)
                        emails.extend(new_emails)
                except:
                    pass
            emails = list(set(emails))
                
        return {
            "emails": emails[:10],
            "phones": phones[:10],
            "has_contact_page": has_contact_page
        }
