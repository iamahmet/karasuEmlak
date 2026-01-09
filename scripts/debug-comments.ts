#!/usr/bin/env tsx
/**
 * Debug Comments API
 * Tests /api/comments endpoint and prints results
 * 
 * Usage:
 *   pnpm debug:comments
 *   API_URL=http://localhost:3001 pnpm debug:comments
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testCommentsAPI() {
  console.log('🧪 Testing Comments API...\n');
  console.log(`📍 API URL: ${API_URL}/api/comments\n`);
  
  try {
    // Test 1: Get all comments
    console.log('📡 Test 1: Fetching all comments...');
    const response = await fetch(`${API_URL}/api/comments`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Request ID: ${data.requestId || 'N/A'}`);
    
    // Extract comments from response
    let comments: any[] = [];
    if (data.data?.comments && Array.isArray(data.data.comments)) {
      comments = data.data.comments;
    } else if (Array.isArray(data.data)) {
      comments = data.data;
    } else if (Array.isArray(data.comments)) {
      comments = data.comments;
    }
    
    console.log(`   Comments found: ${comments.length}\n`);
    
    if (comments.length > 0) {
      console.log('✅ Success! Comments found\n');
      
      console.log('📝 First 3 comments:');
      comments.slice(0, 3).forEach((c: any, i: number) => {
        console.log(`  ${i + 1}. ID: ${c.id}`);
        console.log(`     Author: ${c.author_name} (${c.author_email || 'no email'})`);
        console.log(`     Status: ${c.status || 'unknown'}`);
        console.log(`     Content: ${(c.content || '').substring(0, 60)}...`);
        console.log(`     Created: ${c.created_at || 'N/A'}`);
        console.log('');
      });
      
      console.log('📊 Status breakdown:');
      const statusCounts = comments.reduce((acc: any, c: any) => {
        const status = c.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No comments returned (but API succeeded)\n');
      console.log('Response structure:', {
        success: data.success,
        hasData: !!data.data,
        hasDataComments: !!data.data?.comments,
        hasComments: !!data.comments,
        dataType: typeof data.data,
        dataIsArray: Array.isArray(data.data),
        topLevelKeys: Object.keys(data),
        dataKeys: data.data ? Object.keys(data.data) : []
      });
    }
    
    // Test 2: Get approved comments only
    console.log('\n📡 Test 2: Fetching approved comments only...');
    const approvedResponse = await fetch(`${API_URL}/api/comments?status=approved`);
    const approvedData = await approvedResponse.json();
    
    let approvedComments: any[] = [];
    if (approvedData.data?.comments && Array.isArray(approvedData.data.comments)) {
      approvedComments = approvedData.data.comments;
    } else if (Array.isArray(approvedData.data)) {
      approvedComments = approvedData.data;
    }
    
    console.log(`   Approved comments: ${approvedComments.length}`);
    if (approvedComments.length > 0) {
      console.log(`   ✅ Found ${approvedComments.length} approved comments`);
    } else {
      console.log(`   ⚠️  No approved comments found`);
    }
    
    // Test 3: Get pending comments only
    console.log('\n📡 Test 3: Fetching pending comments only...');
    const pendingResponse = await fetch(`${API_URL}/api/comments?status=pending`);
    const pendingData = await pendingResponse.json();
    
    let pendingComments: any[] = [];
    if (pendingData.data?.comments && Array.isArray(pendingData.data.comments)) {
      pendingComments = pendingData.data.comments;
    } else if (Array.isArray(pendingData.data)) {
      pendingComments = pendingData.data;
    }
    
    console.log(`   Pending comments: ${pendingComments.length}`);
    if (pendingComments.length > 0) {
      console.log(`   ✅ Found ${pendingComments.length} pending comments`);
    } else {
      console.log(`   ⚠️  No pending comments found`);
    }
    
    console.log('\n✨ Debug complete!\n');
    
    // Exit with error if no comments found
    if (comments.length === 0) {
      console.error('❌ No comments found in database. Check:');
      console.error('   1. Database has comments (run SQL: SELECT COUNT(*) FROM public.content_comments)');
      console.error('   2. RPC function exists (get_content_comments)');
      console.error('   3. PostgREST schema cache is up to date');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCommentsAPI();
