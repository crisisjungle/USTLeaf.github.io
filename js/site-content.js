(function() {
    window.UST_LEAF_CONTENT = {
        pageTitles: {
            home: '校园植物展示网站',
            trail: '植物足迹 - 校园植物展示网站',
            gallery: '植物图库 - 校园植物展示网站',
            about: '关于我们 - 校园植物展示网站',
            album: '科大相册 - 校园植物展示网站',
            plantDetail: '植物详情 - 一叶知科'
        },
        navigation: [
            {
                key: 'trail',
                label: '植物足迹',
                href: 'plant-trail.html',
                children: [
                    { label: '校园景点', href: 'plant-trail.html#map-scenic' },
                    { label: '校园步道', href: 'plant-trail.html#map-trail' }
                ]
            },
            {
                key: 'gallery',
                label: '植物图库',
                href: 'gallery.html',
                children: [
                    { label: '植物数据库', href: 'gallery.html#gallery-database' },
                    { label: '植物图片库', href: 'gallery.html#gallery-photos' },
                    { label: '共享相册', href: 'ust-album.html' }
                ]
            },
            {
                key: 'about',
                label: '关于我们',
                href: 'about.html',
                children: [
                    { label: '关于我们', href: 'about.html#about-us' },
                    { label: '联系我们', href: 'about.html#contact-us' }
                ]
            }
        ],
        footer: {
            sections: [
                {
                    title: '植物足迹',
                    links: [
                        { label: '校园景点', href: 'plant-trail.html#map-scenic' },
                        { label: '校园步道', href: 'plant-trail.html#map-trail' }
                    ]
                },
                {
                    title: '植物数据库',
                    links: [
                        { label: '植物数据库', href: 'gallery.html#gallery-database' },
                        { label: '植物图片库', href: 'gallery.html#gallery-photos' }
                    ]
                },
                {
                    title: '关于我们',
                    links: [
                        { label: '关于我们', href: 'about.html#about-us' },
                        { label: '联系我们', href: 'about.html#contact-us' }
                    ]
                }
            ],
            socialLabel: 'Follow us',
            socialLinks: [
                { label: 'Facebook', href: '#', icon: 'images/facebook-logo.png' },
                { label: 'Twitter', href: '#', icon: 'images/twitter-logo.png' },
                { label: 'Instagram', href: '#', icon: 'images/instagram-logo.png' }
            ],
            copyright: '&copy; 2025 一叶知科HKUST through a Leaf'
        },
        ui: {
            plantCard: {
                learnMoreLabel: '了解更多 →',
                unknown: '未知',
                noDescription: '暂无描述',
                loadErrorName: '信息加载失败',
                loadErrorDescription: '无法找到该植物的详细信息。'
            },
            plantDetail: {
                sections: {
                    details: '物种资料',
                    gallery: '植物相册'
                },
                buttons: {
                    back: '← 返回',
                    backToGallery: '返回植物图库'
                },
                labels: {
                    cnName: '中文名',
                    latinName: '学名',
                    family: '科名',
                    type: '种类',
                    synonyms: '异名',
                    nativeHk: '香港原生',
                    description: '形态描述',
                    cap586: '《保护濒危动植物物种条例》(第586章)',
                    cap96: '《林区及郊区条例》(第96章)',
                    redbook: '中国植物红皮书',
                    iucn: 'IUCN红色名录',
                    hkSpeciesDb: '香港物种数据库',
                    viewHkSpeciesDb: '查看香港物种数据库',
                    sourceInfo: '资料集详情'
                },
                statusDisplay: {
                    yes: '是',
                    no: '否',
                    info: '未列入',
                    unknown: '未评估',
                    warning: '易危 (VU)'
                },
                errors: {
                    notFoundTitle: '植物未找到',
                    missingId: '未指定植物ID。请使用格式: gallery/plant.html?id=0101',
                    loadFailed: '无法加载植物数据。',
                    notFoundPrefix: '未找到ID为 "',
                    notFoundSuffix: '" 的植物。'
                }
            }
        },
        trailPlants: [
            {
                id: '1',
                sectionId: 'section-image3',
                name: '王棕',
                scientificName: 'Roystonea regia',
                family: '棕榈科 Arecaceae',
                habit: '常绿乔木',
                flowering: '4-7月',
                distribution: '原产古巴和中美洲，现广泛引种于全球热带和亚热带地区',
                description: '高大优美的棕榈树，树干挺直如柱，灰白色。',
                image: 'plant-database/0101王棕/t2.jpeg',
                infoLink: 'gallery/plant.html?id=0101'
            },
            {
                id: '2',
                sectionId: 'section-image3',
                name: '假连翘',
                scientificName: 'Duranta erecta',
                family: '马鞭草科 Verbenaceae',
                habit: '常绿灌木',
                flowering: '4-10月',
                distribution: '原产美洲热带和亚热带地区，现广泛引种于全球热带和亚热带地区',
                description: '常绿灌木，花朵紫色或白色，果实黄色。',
                image: 'plant-database/0107假连翘/l1.jpeg',
                infoLink: 'gallery/plant.html?id=0107'
            },
            {
                id: '3',
                sectionId: 'section-image3',
                name: '红花檵木',
                scientificName: 'Loropetalum chinense var. rubrum',
                family: '金缕梅科 Hamamelidaceae',
                habit: '常绿灌木或小乔木',
                flowering: '3-4月',
                distribution: '中国南部、日本',
                description: '常绿灌木或小乔木，叶色紫红，花朵粉红色或红色。',
                image: 'plant-database/0108红花檵木/l1.jpeg',
                infoLink: 'gallery/plant.html?id=0108'
            },
            {
                id: '4',
                sectionId: 'section-image3',
                name: '异叶南洋杉',
                scientificName: 'Araucaria heterophylla',
                family: '南洋杉科 Araucariaceae',
                habit: '常绿乔木',
                flowering: '5-7月',
                distribution: '原产诺福克岛，现广泛引种于全球热带和亚热带地区',
                description: '常绿乔木，树形优美，呈塔状。',
                image: 'plant-database/0105异叶南洋杉/t1.jpeg',
                infoLink: 'gallery/plant.html?id=0105'
            },
            {
                id: '5',
                sectionId: 'section-image3',
                name: '细叶榕',
                scientificName: 'Ficus microcarpa',
                family: '桑科 Moraceae',
                habit: '常绿乔木',
                flowering: '全年',
                distribution: '亚洲热带和亚热带地区',
                description: '常绿乔木，叶片革质，适应性强。',
                image: 'plant-database/0102细叶榕/b1.jpeg',
                infoLink: 'gallery/plant.html?id=0102'
            },
            {
                id: '6',
                sectionId: 'section-image3',
                name: '朱蕉',
                scientificName: 'Cordyline fruticosa',
                family: '龙舌兰科 Agavaceae',
                habit: '常绿灌木',
                flowering: '不明显',
                distribution: '原产亚洲东南部和太平洋岛屿，现广泛引种于全球热带和亚热带地区',
                description: '常绿灌木，叶色多样，常用于园林观赏。',
                image: 'plant-database/0106朱蕉/l2.jpeg',
                infoLink: 'gallery/plant.html?id=0106'
            },
            {
                id: '7',
                sectionId: 'section-image3',
                name: '凤凰木',
                scientificName: 'Delonix regia',
                family: '豆科 Fabaceae',
                habit: '落叶乔木',
                flowering: '5-7月',
                distribution: '原产马达加斯加，现广泛引种于全球热带地区',
                description: '落叶乔木，夏季开鲜艳的红色花朵。',
                image: 'plant-database/0103凤凰木/t1.jpeg',
                infoLink: 'gallery/plant.html?id=0103'
            },
            {
                id: '8',
                sectionId: 'section-image3',
                name: '樟树',
                scientificName: 'Cinnamomum camphora',
                family: '樟科 Lauraceae',
                habit: '常绿乔木',
                flowering: '4-5月',
                distribution: '中国南部、日本、韩国',
                description: '常绿乔木，全株具樟脑香气。',
                image: 'plant-database/0104樟树/t1.jpeg',
                infoLink: 'gallery/plant.html?id=0104'
            },
            {
                id: '1',
                sectionId: 'section-image1',
                name: '麻楝',
                scientificName: 'Chukrasia tabularis',
                family: '楝科 Meliaceae',
                habit: '常绿乔木',
                flowering: '5-6月',
                distribution: '热带亚洲，包括中国南部、印度和东南亚',
                description: '麻楝是一种高大的常绿乔木，常高达20-30米。叶子呈羽状复叶，花小而芳香。在多种环境中生长良好，树龄可达百年以上。',
                image: 'plant-database/0331麻楝/l1.jpg',
                infoLink: 'gallery/plant.html?id=mahlian'
            },
            {
                id: '2',
                sectionId: 'section-image1',
                name: '蒲葵',
                scientificName: 'Livistona chinensis',
                family: '棕榈科 Arecaceae',
                habit: '常绿乔木',
                flowering: '4-5月',
                distribution: '中国南部、日本、琉球群岛',
                description: '蒲葵是一种优雅的扇形棕榈树，树干挺直，树冠呈圆形。叶子大而圆，呈扇形，边缘下垂，形似中国传统的蒲扇，因而得名。在广东、福建、台湾等地常见于庭园种植。',
                image: 'plant-database/0328蒲葵/t1.jpg',
                infoLink: 'gallery/plant.html?id=pukui'
            },
            {
                id: '3',
                sectionId: 'section-image1',
                name: '黄葛树',
                scientificName: 'Ficus virens',
                family: '桑科 Moraceae',
                habit: '常绿乔木',
                flowering: '3-5月',
                distribution: '亚洲热带和亚热带地区',
                description: '黄葛树是一种高大的常绿乔木，树冠广阔，有气生根。叶片卵形至椭圆形，深绿色有光泽。果实小而多，成熟时呈红色或紫色。在中国南方常作为行道树或庭院树种植。',
                image: 'plant-database/0327黄葛树/r1.jpg',
                infoLink: 'gallery/plant.html?id=huanggeshu'
            },
            {
                id: '4',
                sectionId: 'section-image1',
                name: '山指甲',
                scientificName: 'Rhododendron simsii',
                family: '杜鹃花科 Ericaceae',
                habit: '常绿或半常绿灌木',
                flowering: '2-4月',
                distribution: '中国中南部和华南地区、越南',
                description: '山指甲是一种灌木，高1-3米。叶片椭圆形或卵形，花朵艳丽，颜色多变，从粉红到深红。是中国原生杜鹃花的一种，常用于园林观赏。',
                image: 'plant-database/0307山指甲/f5.JPG',
                infoLink: 'gallery/plant.html?id=shanzhijia'
            },
            {
                id: '5',
                sectionId: 'section-image1',
                name: '石栗',
                scientificName: 'Aleurites moluccana',
                family: '大戟科 Euphorbiaceae',
                habit: '常绿乔木',
                flowering: '5-7月',
                distribution: '东南亚、印度、太平洋岛屿',
                description: '石栗是一种中型至大型常绿乔木，高可达20米。叶片宽大，星状或掌状，表面有一层蜡质粉末，呈银白色。果实大而圆，有硬壳，类似于栗子，内含油性种子。在热带地区广泛种植，种子可提取油脂用于照明和食用。',
                image: 'plant-database/0341石栗/t1.jpg',
                infoLink: 'gallery/plant.html?id=shili'
            },
            {
                id: '6',
                sectionId: 'section-image1',
                name: '锦绣杜鹃',
                scientificName: 'Rhododendron pulchrum',
                family: '杜鹃花科 Ericaceae',
                habit: '常绿或半常绿灌木',
                flowering: '3-5月',
                distribution: '中国南部、日本',
                description: '锦绣杜鹃是常见的园艺品种，常绿或半常绿灌木，高1-2米。叶椭圆形或卵状披针形。花冠漏斗状，色彩艳丽，通常为玫瑰红色或紫色。',
                image: 'plant-database/0314锦绣杜鹃/f1.jpg',
                infoLink: 'gallery/plant.html?id=jinxidujuan'
            },
            {
                id: '7',
                sectionId: 'section-image1',
                name: '银珠',
                scientificName: 'Ardisia crenata',
                family: '紫金牛科 Myrsinaceae',
                habit: '常绿灌木',
                flowering: '6-8月',
                distribution: '中国南部、日本、朝鲜半岛',
                description: '银珠是一种小型常绿灌木，高度通常不超过1米。叶子深绿色有光泽，边缘有细锯齿。开小白花，结鲜红色浆果，冬季尤为醒目，故又称\'十样锦\'。耐阴性强，适合作为室内或阴凉处的观赏植物。',
                image: 'plant-database/0340银珠/t1.jpg',
                infoLink: 'gallery/plant.html?id=yinzhu'
            },
            {
                id: '8',
                sectionId: 'section-image1',
                name: '圆柏',
                scientificName: 'Juniperus chinensis',
                family: '柏科 Cupressaceae',
                habit: '常绿乔木',
                flowering: '3-4月',
                distribution: '中国北部和中部、蒙古、日本、韩国',
                description: '圆柏是一种常绿针叶树，可长成高大乔木或修剪成灌木形态。叶子鳞片状或针状，深绿色。球果小而圆，成熟时呈蓝黑色。适应性强，耐干旱和贫瘠土壤，常用于园林绿化和防风固沙。',
                image: 'plant-database/0333圆柏/t1.jpg',
                infoLink: 'gallery/plant.html?id=yuanbai'
            },
            {
                id: '1',
                sectionId: 'section-image2',
                name: '细叶榕',
                scientificName: 'Ficus microcarpa',
                family: '桑科 Moraceae',
                habit: '常绿乔木',
                flowering: '全年',
                distribution: '亚洲热带和亚热带地区',
                description: '常绿乔木，叶片革质，卵形至椭圆形，果实为隐头果。适应性强，常见于公园和街道两旁。',
                image: 'plant-database/0424细叶榕/b3.JPG',
                infoLink: 'gallery/plant.html?id=xiyerong'
            },
            {
                id: '2',
                sectionId: 'section-image2',
                name: '日本葵',
                scientificName: 'Fatsia japonica',
                family: '五加科 Araliaceae',
                habit: '常绿灌木',
                flowering: '10-11月',
                distribution: '日本、韩国、台湾',
                description: '日本葵是一种常绿灌木，高可达3米。叶子大而漂亮，掌状深裂，革质，深绿有光泽。花小而白，排列成伞形花序。耐阴性强，喜湿润环境，是常见的室内观叶植物，也适合作为庭院或公园的下层绿化植物。',
                image: 'plant-database/0421日本葵/l3.JPG',
                infoLink: 'gallery/plant.html?id=ribenkui'
            },
            {
                id: '3',
                sectionId: 'section-image2',
                name: '菲岛福木',
                scientificName: 'Garcinia subelliptica',
                family: '藤黄科 Clusiaceae',
                habit: '常绿乔木',
                flowering: '5-6月',
                distribution: '中国南部、日本琉球群岛、菲律宾',
                description: '菲岛福木是一种中型常绿乔木，高可达10米。树冠圆整，枝叶密集。叶片椭圆形，革质，深绿色有光泽。花小而芳香，雌雄异株。果实球形，成熟时呈橙黄色，可食用。木材坚硬，可用于建筑和家具制作。树形优美，常作为园林观赏树或行道树栽培。',
                image: 'plant-database/0418菲岛福木/t1.JPG',
                infoLink: 'gallery/plant.html?id=feidaofumu'
            },
            {
                id: '4',
                sectionId: 'section-image2',
                name: '桃花心木',
                scientificName: 'Swietenia macrophylla',
                family: '楝科 Meliaceae',
                habit: '常绿乔木',
                flowering: '4-5月',
                distribution: '原产中南美洲，现广泛引种于亚洲热带地区',
                description: '桃花心木是著名的热带珍贵用材树种，高可达45米。树干通直，树冠广展。叶为偶数羽状复叶，小叶片镰刀状长椭圆形。果实为大型木质蒴果，种子扁平有翅。木材红褐色，纹理美观，是制作高级家具的优良材料。在园林中常作为行道树或景观树种植。',
                image: 'plant-database/0417桃花心木/b1.JPG',
                infoLink: 'gallery/plant.html?id=taohuaxinmu'
            },
            {
                id: '5',
                sectionId: 'section-image2',
                name: '王棕',
                scientificName: 'Roystonea regia',
                family: '棕榈科 Arecaceae',
                habit: '常绿乔木',
                flowering: '4-7月',
                distribution: '原产古巴和中美洲，现广泛引种于全球热带和亚热带地区',
                description: '王棕是一种高大优美的棕榈树，高可达25米。树干挺直如柱，灰白色，中部常膨大。叶为大型羽状复叶，长可达4米，小叶片线形，优雅下垂。花序大型，分枝多。果实椭圆形，红色至紫黑色。是热带和亚热带地区最重要的观赏棕榈之一，常用于道路、广场和公园绿化。',
                image: 'plant-database/0416王棕/l3.JPG',
                infoLink: 'gallery/plant.html?id=wangzong'
            },
            {
                id: '6',
                sectionId: 'section-image2',
                name: '蒲葵',
                scientificName: 'Livistona chinensis',
                family: '棕榈科 Arecaceae',
                habit: '常绿乔木',
                flowering: '3-5月',
                distribution: '中国南部、日本、琉球群岛',
                description: '蒲葵是一种优雅的扇形棕榈树，树干挺直，树冠呈圆形。叶子大而圆，呈扇形，边缘下垂，形似中国传统的蒲扇，因而得名。在广东、福建、台湾等地常见于庭园种植。叶片可用于编织扇子、帽子等生活用品，树干可用于建筑和家具制作，果实和幼芽可食用，全株均有药用价值。',
                image: 'plant-database/0415蒲葵/b1.JPG',
                infoLink: 'gallery/plant.html?id=pukui-new'
            }
        ]
    };
})();
