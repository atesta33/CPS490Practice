import { useQuery } from '@tanstack/react-query'
import { getPosts } from '../api/posts.js'
import { PostList } from '../components/PostList'
import { CreatePost } from '../components/CreatePost.jsx'
import { PostFilter } from '../components/PostFilter.jsx'
import { PostSorting } from '../components/PostSorting.jsx'
import { useState } from 'react'
import { Header } from '../components/Header.jsx'
import styles from './Blog.module.css'


export function Blog() {
    const [author, setAuthor] = useState('')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('descending')
    const postsQuery = useQuery({
            queryKey: ['posts', {author, sortBy, sortOrder} ],
            queryFn: () => getPosts({ author, sortBy, sortOrder }),
        })

        const posts = postsQuery.data ?? []
    return (
        <div className={styles.marketplacePage}>
            <Header />

            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>🏪 Auction Marketplace</h1>
                    <p className={styles.pageSubtitle}>
                        Bid on exclusive items and win amazing deals
                    </p>
                </div>

                <section className={styles.createListingSection}>
                    <h2 className={styles.sectionTitle}>List Your Item</h2>
                    <CreatePost />
                </section>

                <div className={styles.toolbar}>
                    <div className={styles.filterGroup}>
                        <span className={styles.toolbarLabel}>Filter by Seller</span>
                        <PostFilter
                            field='author'
                            value={author}
                            onChange={(value) => setAuthor(value)}
                        />
                    </div>

                    <div className={styles.sortGroup}>
                        <span className={styles.toolbarLabel}>Sort Listings</span>
                        <PostSorting
                            fields={['createdAt', 'updatedAt', 'title', 'descriptionLength']}
                            value={sortBy}
                            onChange={(value) => setSortBy(value)}
                            orderValue={sortOrder}
                            onOrderChange={(orderValue) => setSortOrder(orderValue)}
                        />
                    </div>
                </div>

                <div className={styles.listingsSection}>
                    <h2 className={styles.listingsTitle}>
                        Active Auctions <span className={styles.count}>({posts.length})</span>
                    </h2>
                    <PostList posts={posts} />
                </div>
            </div>
        </div>
    )
}