import FabricStoreListings from "@/components/fabric/fabricStoreListing";
import MainLayout from "../../main/layout";

export default function fabricStoreRoute() {
    return (
        <>
            <MainLayout>
                {/* call fabric store listings */}
                <FabricStoreListings />
            </MainLayout>
        </>
    )
}