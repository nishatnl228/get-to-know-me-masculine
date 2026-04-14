/**
 * DB.JS — Supabase-backed data layer
 * ------------------------------------------------------------
 * Replaces localStorage / IndexedDB with:
 * - Supabase Database (content)
 * - Supabase Storage (images + audio)
 *
 * IMPORTANT:
 * 1) Load supabase-config.js BEFORE this file, or set:
 *      window.SUPABASE_URL
 *      window.SUPABASE_ANON_KEY
 * 2) Because this DB is now remote, most methods are async.
 *    You must call them with await.
 *
 * Example:
 *   const cars = await DB.getCars();
 */

(function () {
  const SUPABASE_URL = window.SUPABASE_URL || 'https://tffoycipaduwqrkpbpji.supabase.co';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_j6UPDgDfoRR_lER1VSlOfw_mvfGGtGH';

  const IMAGE_BUCKET = 'site-images';
  const AUDIO_BUCKET = 'site-audio';

  const DB = {
    supabase: null,
    ready: null,

    async init() {
      if (this.supabase) return this.supabase;

      if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_URL === 'PASTE_YOUR_SUPABASE_URL_HERE' ||
        SUPABASE_ANON_KEY === 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
      ) {
        throw new Error(
          'Supabase is not configured. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY before loading db.js.'
        );
      }

      const mod = await import('https://esm.sh/@supabase/supabase-js@2');
      this.supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      return this.supabase;
    },

    async getClient() {
      if (!this.ready) this.ready = this.init();
      return this.ready;
    },

    uid(prefix = 'id') {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    },

    async fileToBase64(file) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });
    },

    normalizeError(error, fallback = 'Unexpected error') {
      if (!error) return new Error(fallback);
      if (error instanceof Error) return error;
      return new Error(error.message || fallback);
    },

    async requireAdmin() {
      const supabase = await this.getClient();

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw this.normalizeError(userError, 'Could not verify current user.');
      if (!user) throw new Error('You must be signed in.');

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw this.normalizeError(error, 'Could not verify admin access.');
      if (!data?.is_admin) throw new Error('You are not authorized as admin.');

      return user;
    },

    extFromFile(file) {
      const raw = file?.name?.split('.').pop()?.toLowerCase();
      if (raw && /^[a-z0-9]+$/i.test(raw)) return raw;
      if (file?.type === 'image/jpeg') return 'jpg';
      if (file?.type === 'image/png') return 'png';
      if (file?.type === 'image/webp') return 'webp';
      if (file?.type === 'audio/mpeg') return 'mp3';
      if (file?.type === 'audio/wav') return 'wav';
      if (file?.type === 'audio/x-wav') return 'wav';
      if (file?.type === 'audio/mp4') return 'm4a';
      if (file?.type === 'audio/aac') return 'aac';
      return 'bin';
    },

    publicUrl(bucket, path) {
      if (!path) return null;
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    },

    extractStoragePath(publicUrl, bucket) {
      if (!publicUrl || typeof publicUrl !== 'string') return null;
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return null;
      return decodeURIComponent(publicUrl.slice(idx + marker.length));
    },

    async uploadFile(bucket, folder, file) {
      if (!file) return null;
      await this.requireAdmin();
      const supabase = await this.getClient();

      const ext = this.extFromFile(file);
      const safeFolder = String(folder || 'misc').replace(/[^a-zA-Z0-9/_-]/g, '_');
      const path = `${safeFolder}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        contentType: file.type || undefined
      });

      if (error) throw this.normalizeError(error, `Failed to upload file to ${bucket}.`);

      return this.publicUrl(bucket, path);
    },

    async deleteFileByPublicUrl(bucket, publicUrl) {
      const path = this.extractStoragePath(publicUrl, bucket);
      if (!path) return false;

      await this.requireAdmin();
      const supabase = await this.getClient();
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.warn('Storage delete warning:', error.message || error);
        return false;
      }
      return true;
    },

    async uploadImage(file, folder = 'images') {
      return await this.uploadFile(IMAGE_BUCKET, folder, file);
    },

    async uploadAudio(file, folder = 'audio') {
      return await this.uploadFile(AUDIO_BUCKET, folder, file);
    },

    async getSession() {
      const supabase = await this.getClient();
      return await supabase.auth.getSession();
    },

    async getUser() {
      const supabase = await this.getClient();
      return await supabase.auth.getUser();
    },

    async signIn(email, password) {
      const supabase = await this.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw this.normalizeError(error, 'Login failed.');
      return data;
    },

    async signOut() {
      const supabase = await this.getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw this.normalizeError(error, 'Logout failed.');
      return true;
    },

    async isAdmin() {
      try {
        await this.requireAdmin();
        return true;
      } catch {
        return false;
      }
    },

    async getCars() {
      const supabase = await this.getClient();

      const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw this.normalizeError(error, 'Failed to load cars.');

      const carIds = (cars || []).map(c => c.id);
      let images = [];

      if (carIds.length) {
        const { data, error: imgError } = await supabase
          .from('car_images')
          .select('*')
          .in('car_id', carIds)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (imgError) throw this.normalizeError(imgError, 'Failed to load car images.');
        images = data || [];
      }

      return (cars || []).map(car => ({
        id: car.id,
        name: car.name || '',
        brand: car.brand || '',
        tag: car.tag || '',
        coverImage: car.cover_image || '',
        dreamColor: car.dream_color || '',
        year: car.year || '',
        horsepower: car.horsepower || '',
        topSpeed: car.top_speed || '',
        drivetrain: car.drivetrain || '',
        bodyType: car.body_type || '',
        whyILoveIt: car.why_i_love_it || '',
        engineSound: car.engine_sound || '',
        description: car.why_i_love_it || '',
        extraImages: images
          .filter(img => img.car_id === car.id)
          .map(img => img.image_url)
      }));
    },

    async addCar(car) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        name: car.name,
        brand: car.brand || '',
        tag: car.tag || '',
        cover_image: car.coverImage || '',
        dream_color: car.dreamColor || '',
        year: car.year || '',
        horsepower: car.horsepower || '',
        top_speed: car.topSpeed || '',
        drivetrain: car.drivetrain || '',
        body_type: car.bodyType || '',
        why_i_love_it: car.whyILoveIt || car.description || '',
        engine_sound: car.engineSound || '',
        sort_order: typeof car.sortOrder === 'number' ? car.sortOrder : 0
      };

      const { data, error } = await supabase
        .from('cars')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add car.');

      const extraImages = Array.isArray(car.extraImages) ? car.extraImages.filter(Boolean) : [];
      if (extraImages.length) {
        const rows = extraImages.map((url, i) => ({
          car_id: data.id,
          image_url: url,
          sort_order: i
        }));
        const { error: imgError } = await supabase.from('car_images').insert(rows);
        if (imgError) throw this.normalizeError(imgError, 'Car created, but extra images failed to save.');
      }

      return data;
    },

    async updateCar(car) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        name: car.name,
        brand: car.brand || '',
        tag: car.tag || '',
        cover_image: car.coverImage || '',
        dream_color: car.dreamColor || '',
        year: car.year || '',
        horsepower: car.horsepower || '',
        top_speed: car.topSpeed || '',
        drivetrain: car.drivetrain || '',
        body_type: car.bodyType || '',
        why_i_love_it: car.whyILoveIt || car.description || '',
        engine_sound: car.engineSound || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('cars').update(payload).eq('id', car.id);
      if (error) throw this.normalizeError(error, 'Failed to update car.');

      const { error: delError } = await supabase.from('car_images').delete().eq('car_id', car.id);
      if (delError) throw this.normalizeError(delError, 'Car updated, but old extra images failed to clear.');

      const extraImages = Array.isArray(car.extraImages) ? car.extraImages.filter(Boolean) : [];
      if (extraImages.length) {
        const rows = extraImages.map((url, i) => ({
          car_id: car.id,
          image_url: url,
          sort_order: i
        }));
        const { error: imgError } = await supabase.from('car_images').insert(rows);
        if (imgError) throw this.normalizeError(imgError, 'Car updated, but extra images failed to save.');
      }

      return true;
    },

    async deleteCar(id) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const carList = await this.getCars();
      const car = carList.find(x => x.id === id);

      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) throw this.normalizeError(error, 'Failed to delete car.');

      if (car?.coverImage) await this.deleteFileByPublicUrl(IMAGE_BUCKET, car.coverImage);
      for (const url of car?.extraImages || []) {
        await this.deleteFileByPublicUrl(IMAGE_BUCKET, url);
      }

      return true;
    },

    async getSports() {
      const supabase = await this.getClient();

      const { data: sports, error } = await supabase
        .from('sports')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw this.normalizeError(error, 'Failed to load sports.');

      const sportIds = (sports || []).map(s => s.id);
      let stats = [];
      let favPhotos = [];
      let gallery = [];

      if (sportIds.length) {
        const [{ data: statsData, error: statsErr }, { data: favData, error: favErr }, { data: galData, error: galErr }] =
          await Promise.all([
            supabase.from('sport_stats').select('*').in('sport_id', sportIds).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
            supabase.from('sport_fav_player_photos').select('*').in('sport_id', sportIds).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
            supabase.from('sport_gallery_photos').select('*').in('sport_id', sportIds).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
          ]);

        if (statsErr) throw this.normalizeError(statsErr, 'Failed to load sport stats.');
        if (favErr) throw this.normalizeError(favErr, 'Failed to load favourite player photos.');
        if (galErr) throw this.normalizeError(galErr, 'Failed to load sport gallery photos.');

        stats = statsData || [];
        favPhotos = favData || [];
        gallery = galData || [];
      }

      return (sports || []).map(sport => ({
        id: sport.id,
        name: sport.name || '',
        subtitle: sport.subtitle || '',
        rating: sport.rating || 0,
        coverImage: sport.cover_image || '',
        memories: sport.memories || '',
        stats: stats
          .filter(x => x.sport_id === sport.id)
          .map(x => ({ label: x.label, value: x.value })),
        favPlayer: {
          name: sport.fav_player_name || '',
          info: sport.fav_player_info || '',
          photos: favPhotos
            .filter(x => x.sport_id === sport.id)
            .map(x => x.image_url)
        },
        photos: gallery
          .filter(x => x.sport_id === sport.id)
          .map(x => x.image_url)
      }));
    },

    async addSport(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        name: item.name,
        subtitle: item.subtitle || '',
        rating: item.rating || 0,
        cover_image: item.coverImage || '',
        memories: item.memories || '',
        fav_player_name: item.favPlayer?.name || '',
        fav_player_info: item.favPlayer?.info || '',
        sort_order: typeof item.sortOrder === 'number' ? item.sortOrder : 0
      };

      const { data, error } = await supabase
        .from('sports')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add sport.');

      const ops = [];

      const statsRows = (item.stats || []).map((s, i) => ({
        sport_id: data.id,
        label: s.label,
        value: Number(s.value || 0),
        sort_order: i
      }));
      if (statsRows.length) ops.push(supabase.from('sport_stats').insert(statsRows));

      const favRows = (item.favPlayer?.photos || []).filter(Boolean).map((url, i) => ({
        sport_id: data.id,
        image_url: url,
        sort_order: i
      }));
      if (favRows.length) ops.push(supabase.from('sport_fav_player_photos').insert(favRows));

      const galleryRows = (item.photos || []).filter(Boolean).map((url, i) => ({
        sport_id: data.id,
        image_url: url,
        sort_order: i
      }));
      if (galleryRows.length) ops.push(supabase.from('sport_gallery_photos').insert(galleryRows));

      const results = await Promise.all(ops);
      const failed = results.find(r => r.error);
      if (failed?.error) throw this.normalizeError(failed.error, 'Sport created, but related data failed to save.');

      return data;
    },

    async updateSport(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        name: item.name,
        subtitle: item.subtitle || '',
        rating: item.rating || 0,
        cover_image: item.coverImage || '',
        memories: item.memories || '',
        fav_player_name: item.favPlayer?.name || '',
        fav_player_info: item.favPlayer?.info || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('sports').update(payload).eq('id', item.id);
      if (error) throw this.normalizeError(error, 'Failed to update sport.');

      const clearOps = await Promise.all([
        supabase.from('sport_stats').delete().eq('sport_id', item.id),
        supabase.from('sport_fav_player_photos').delete().eq('sport_id', item.id),
        supabase.from('sport_gallery_photos').delete().eq('sport_id', item.id)
      ]);

      const clearFailed = clearOps.find(r => r.error);
      if (clearFailed?.error) throw this.normalizeError(clearFailed.error, 'Sport updated, but old related data failed to clear.');

      const insertOps = [];
      const statsRows = (item.stats || []).map((s, i) => ({
        sport_id: item.id,
        label: s.label,
        value: Number(s.value || 0),
        sort_order: i
      }));
      if (statsRows.length) insertOps.push(supabase.from('sport_stats').insert(statsRows));

      const favRows = (item.favPlayer?.photos || []).filter(Boolean).map((url, i) => ({
        sport_id: item.id,
        image_url: url,
        sort_order: i
      }));
      if (favRows.length) insertOps.push(supabase.from('sport_fav_player_photos').insert(favRows));

      const galleryRows = (item.photos || []).filter(Boolean).map((url, i) => ({
        sport_id: item.id,
        image_url: url,
        sort_order: i
      }));
      if (galleryRows.length) insertOps.push(supabase.from('sport_gallery_photos').insert(galleryRows));

      const results = await Promise.all(insertOps);
      const failed = results.find(r => r.error);
      if (failed?.error) throw this.normalizeError(failed.error, 'Sport updated, but related data failed to save.');

      return true;
    },

    async deleteSport(id) {
      await this.requireAdmin();
      const supabase = await this.getClient();
      const sports = await this.getSports();
      const item = sports.find(x => x.id === id);

      const { error } = await supabase.from('sports').delete().eq('id', id);
      if (error) throw this.normalizeError(error, 'Failed to delete sport.');

      if (item?.coverImage) await this.deleteFileByPublicUrl(IMAGE_BUCKET, item.coverImage);
      for (const url of item?.favPlayer?.photos || []) await this.deleteFileByPublicUrl(IMAGE_BUCKET, url);
      for (const url of item?.photos || []) await this.deleteFileByPublicUrl(IMAGE_BUCKET, url);

      return true;
    },

    async getStudio() {
      const supabase = await this.getClient();

      const { data: studioItems, error } = await supabase
        .from('studio_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw this.normalizeError(error, 'Failed to load studio items.');

      const ids = (studioItems || []).map(x => x.id);
      let recordings = [];

      if (ids.length) {
        const { data, error: recErr } = await supabase
          .from('studio_recordings')
          .select('*')
          .in('studio_id', ids)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (recErr) throw this.normalizeError(recErr, 'Failed to load studio recordings.');
        recordings = data || [];
      }

      return (studioItems || []).map(item => ({
        id: item.id,
        title: item.title || '',
        category: item.category || '',
        mood: item.mood || '',
        coverImage: item.cover_image || '',
        audioFile: item.audio_file || '',
        description: item.description || '',
        recordings: recordings
          .filter(r => r.studio_id === item.id)
          .map(r => ({
            id: r.id,
            name: r.name,
            file_url: r.file_url
          }))
      }));
    },

    async addStudioItem(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        title: item.title,
        category: item.category || '',
        mood: item.mood || '',
        cover_image: item.coverImage || '',
        audio_file: item.audioFile || '',
        description: item.description || '',
        sort_order: typeof item.sortOrder === 'number' ? item.sortOrder : 0
      };

      const { data, error } = await supabase
        .from('studio_items')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add studio item.');

      const recordings = (item.recordings || []).filter(r => r?.name && r?.file_url);
      if (recordings.length) {
        const rows = recordings.map((r, i) => ({
          studio_id: data.id,
          name: r.name,
          file_url: r.file_url,
          sort_order: i
        }));
        const { error: recErr } = await supabase.from('studio_recordings').insert(rows);
        if (recErr) throw this.normalizeError(recErr, 'Studio item created, but recordings failed to save.');
      }

      return data;
    },

    async updateStudioItem(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        title: item.title,
        category: item.category || '',
        mood: item.mood || '',
        cover_image: item.coverImage || '',
        audio_file: item.audioFile || '',
        description: item.description || '',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('studio_items').update(payload).eq('id', item.id);
      if (error) throw this.normalizeError(error, 'Failed to update studio item.');

      return true;
    },

    async deleteStudioItem(id) {
      await this.requireAdmin();
      const supabase = await this.getClient();
      const studio = await this.getStudio();
      const item = studio.find(x => x.id === id);

      const { error } = await supabase.from('studio_items').delete().eq('id', id);
      if (error) throw this.normalizeError(error, 'Failed to delete studio item.');

      if (item?.coverImage) await this.deleteFileByPublicUrl(IMAGE_BUCKET, item.coverImage);
      if (item?.audioFile) await this.deleteFileByPublicUrl(AUDIO_BUCKET, item.audioFile);
      for (const rec of item?.recordings || []) {
        await this.deleteFileByPublicUrl(AUDIO_BUCKET, rec.file_url);
      }

      return true;
    },

    async addRecordingMeta(studioId, rec) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        studio_id: studioId,
        name: rec.name,
        file_url: rec.file_url,
        sort_order: typeof rec.sort_order === 'number' ? rec.sort_order : 0
      };

      const { data, error } = await supabase
        .from('studio_recordings')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add recording.');
      return data;
    },

    async deleteRecording(studioId, recId) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const { data: rec, error: getErr } = await supabase
        .from('studio_recordings')
        .select('*')
        .eq('id', recId)
        .eq('studio_id', studioId)
        .single();

      if (getErr) throw this.normalizeError(getErr, 'Recording not found.');

      const { error } = await supabase
        .from('studio_recordings')
        .delete()
        .eq('id', recId)
        .eq('studio_id', studioId);

      if (error) throw this.normalizeError(error, 'Failed to delete recording.');

      if (rec?.file_url) await this.deleteFileByPublicUrl(AUDIO_BUCKET, rec.file_url);
      return true;
    },

    async getRecordingURL(recId) {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('studio_recordings')
        .select('file_url')
        .eq('id', recId)
        .single();

      if (error) throw this.normalizeError(error, 'Failed to load recording URL.');
      return data?.file_url || null;
    },

    async getTravel() {
      const supabase = await this.getClient();

      const { data: travelItems, error } = await supabase
        .from('travel_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw this.normalizeError(error, 'Failed to load travel items.');

      const ids = (travelItems || []).map(x => x.id);
      let tags = [];
      let photos = [];

      if (ids.length) {
        const [{ data: tagData, error: tagErr }, { data: photoData, error: photoErr }] = await Promise.all([
          supabase.from('travel_tags').select('*').in('travel_id', ids).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
          supabase.from('travel_photos').select('*').in('travel_id', ids).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
        ]);

        if (tagErr) throw this.normalizeError(tagErr, 'Failed to load travel tags.');
        if (photoErr) throw this.normalizeError(photoErr, 'Failed to load travel photos.');

        tags = tagData || [];
        photos = photoData || [];
      }

      return (travelItems || []).map(item => ({
        id: item.id,
        place: item.place || '',
        country: item.country || '',
        year: item.year || '',
        coverImage: item.cover_image || '',
        note: item.note || '',
        favoriteMoment: item.favorite_moment || '',
        bestFood: item.best_food || '',
        revisit: !!item.revisit,
        tags: tags.filter(t => t.travel_id === item.id).map(t => t.tag),
        photos: photos.filter(p => p.travel_id === item.id).map(p => p.image_url)
      }));
    },

    async addTravel(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        place: item.place,
        country: item.country || '',
        year: item.year || '',
        cover_image: item.coverImage || '',
        note: item.note || '',
        favorite_moment: item.favoriteMoment || '',
        best_food: item.bestFood || '',
        revisit: !!item.revisit,
        sort_order: typeof item.sortOrder === 'number' ? item.sortOrder : 0
      };

      const { data, error } = await supabase
        .from('travel_items')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add travel item.');

      const ops = [];

      const tagRows = (item.tags || []).filter(Boolean).map((tag, i) => ({
        travel_id: data.id,
        tag,
        sort_order: i
      }));
      if (tagRows.length) ops.push(supabase.from('travel_tags').insert(tagRows));

      const photoRows = (item.photos || []).filter(Boolean).map((url, i) => ({
        travel_id: data.id,
        image_url: url,
        sort_order: i
      }));
      if (photoRows.length) ops.push(supabase.from('travel_photos').insert(photoRows));

      const results = await Promise.all(ops);
      const failed = results.find(r => r.error);
      if (failed?.error) throw this.normalizeError(failed.error, 'Travel item created, but related data failed to save.');

      return data;
    },

    async updateTravel(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        place: item.place,
        country: item.country || '',
        year: item.year || '',
        cover_image: item.coverImage || '',
        note: item.note || '',
        favorite_moment: item.favoriteMoment || '',
        best_food: item.bestFood || '',
        revisit: !!item.revisit,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('travel_items').update(payload).eq('id', item.id);
      if (error) throw this.normalizeError(error, 'Failed to update travel item.');

      const clearOps = await Promise.all([
        supabase.from('travel_tags').delete().eq('travel_id', item.id),
        supabase.from('travel_photos').delete().eq('travel_id', item.id)
      ]);
      const clearFailed = clearOps.find(r => r.error);
      if (clearFailed?.error) throw this.normalizeError(clearFailed.error, 'Travel item updated, but old related data failed to clear.');

      const insertOps = [];
      const tagRows = (item.tags || []).filter(Boolean).map((tag, i) => ({
        travel_id: item.id,
        tag,
        sort_order: i
      }));
      if (tagRows.length) insertOps.push(supabase.from('travel_tags').insert(tagRows));

      const photoRows = (item.photos || []).filter(Boolean).map((url, i) => ({
        travel_id: item.id,
        image_url: url,
        sort_order: i
      }));
      if (photoRows.length) insertOps.push(supabase.from('travel_photos').insert(photoRows));

      const results = await Promise.all(insertOps);
      const failed = results.find(r => r.error);
      if (failed?.error) throw this.normalizeError(failed.error, 'Travel item updated, but related data failed to save.');

      return true;
    },

    async deleteTravel(id) {
      await this.requireAdmin();
      const supabase = await this.getClient();
      const travel = await this.getTravel();
      const item = travel.find(x => x.id === id);

      const { error } = await supabase.from('travel_items').delete().eq('id', id);
      if (error) throw this.normalizeError(error, 'Failed to delete travel item.');

      if (item?.coverImage) await this.deleteFileByPublicUrl(IMAGE_BUCKET, item.coverImage);
      for (const url of item?.photos || []) await this.deleteFileByPublicUrl(IMAGE_BUCKET, url);

      return true;
    },

    async getProfile() {
      const supabase = await this.getClient();

      const { data: profile, error } = await supabase
        .from('site_profile')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw this.normalizeError(error, 'Failed to load profile.');

      if (!profile) {
        return {
          name: '',
          nickname: '',
          tagline: '',
          bio: '',
          profileImage: '',
          favoriteTeam: '',
          favoriteCar: '',
          favoriteGenre: '',
          favoritePlace: '',
          favoriteQuote: '',
          stats: []
        };
      }

      const { data: stats, error: statsErr } = await supabase
        .from('profile_stats')
        .select('*')
        .eq('profile_id', profile.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (statsErr) throw this.normalizeError(statsErr, 'Failed to load profile stats.');

      return {
        id: profile.id,
        name: profile.name || '',
        nickname: profile.nickname || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        profileImage: profile.profile_image || '',
        favoriteTeam: profile.favorite_team || '',
        favoriteCar: profile.favorite_car || '',
        favoriteGenre: profile.favorite_genre || '',
        favoritePlace: profile.favorite_place || '',
        favoriteQuote: profile.favorite_quote || '',
        stats: (stats || []).map(s => ({ label: s.label, value: s.value }))
      };
    },

    async saveProfile(profile) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const existing = await this.getProfile();
      const basePayload = {
        name: profile.name || '',
        nickname: profile.nickname || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        profile_image: profile.profileImage || '',
        favorite_team: profile.favoriteTeam || '',
        favorite_car: profile.favoriteCar || '',
        favorite_genre: profile.favoriteGenre || '',
        favorite_place: profile.favoritePlace || '',
        favorite_quote: profile.favoriteQuote || '',
        updated_at: new Date().toISOString()
      };

      let profileId = existing.id;

      if (profileId) {
        const { error } = await supabase.from('site_profile').update(basePayload).eq('id', profileId);
        if (error) throw this.normalizeError(error, 'Failed to update profile.');
      } else {
        const { data, error } = await supabase
          .from('site_profile')
          .insert(basePayload)
          .select()
          .single();
        if (error) throw this.normalizeError(error, 'Failed to create profile.');
        profileId = data.id;
      }

      const { error: delErr } = await supabase.from('profile_stats').delete().eq('profile_id', profileId);
      if (delErr) throw this.normalizeError(delErr, 'Profile saved, but old profile stats failed to clear.');

      const statRows = (profile.stats || []).filter(s => s?.label).map((s, i) => ({
        profile_id: profileId,
        label: s.label,
        value: Number(s.value || 0),
        sort_order: i
      }));

      if (statRows.length) {
        const { error: statsErr } = await supabase.from('profile_stats').insert(statRows);
        if (statsErr) throw this.normalizeError(statsErr, 'Profile saved, but profile stats failed to save.');
      }

      return true;
    },

    async getHighlights() {
      const supabase = await this.getClient();

      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw this.normalizeError(error, 'Failed to load highlights.');

      return (data || []).map(item => ({
        id: item.id,
        icon: item.icon || '',
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        rarity: item.rarity || 'Common'
      }));
    },

    async addHighlight(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        icon: item.icon || '',
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        rarity: item.rarity || 'Common',
        sort_order: typeof item.sortOrder === 'number' ? item.sortOrder : 0
      };

      const { data, error } = await supabase
        .from('highlights')
        .insert(payload)
        .select()
        .single();

      if (error) throw this.normalizeError(error, 'Failed to add highlight.');
      return data;
    },

    async updateHighlight(item) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const payload = {
        icon: item.icon || '',
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        rarity: item.rarity || 'Common',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('highlights').update(payload).eq('id', item.id);
      if (error) throw this.normalizeError(error, 'Failed to update highlight.');
      return true;
    },

    async deleteHighlight(id) {
      await this.requireAdmin();
      const supabase = await this.getClient();

      const { error } = await supabase.from('highlights').delete().eq('id', id);
      if (error) throw this.normalizeError(error, 'Failed to delete highlight.');
      return true;
    }
  };

  window.DB = DB;
})();